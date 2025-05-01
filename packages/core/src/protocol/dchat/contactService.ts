import { IContactSchema, ContactSchema } from '../../schema/contact'
import { ContactType } from '../../schema/contactEnum'
import { ContactDb } from '../database/contact'
import Dexie from 'dexie'
import { logger } from '../../utils/log'
import { CacheDb } from '../database/cache'
import { v4 as uuidv4 } from 'uuid'
import { MultiClient } from 'nkn-sdk'
import { MessageService, sendOptions } from './messageService'
import { IPayloadSchema } from '../../schema/payload'
import { MediaType } from '../database/cache'

const PROFILE_EXPIRATION_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export class ContactService {
  static getDefaultNickName(address: string): string {
    const index = address.lastIndexOf('.')
    if (index < 0) {
      return address.substring(0, 6)
    } else if (address.length > index + 7) {
      return address.substring(0, index + 7)
    } else {
      return address
    }
  }

  static async getOrCreateContact({
    client,
    db,
    address,
    type,
    version
  }: {
    client?: MultiClient
    db: Dexie
    address: string
    type?: ContactType
    version?: string
  }): Promise<ContactSchema | null> {
    if (!address || !db) return null

    const contactDb = new ContactDb(db)
    const contact = await contactDb.getContactByAddress(address)

    if (contact) {
      const contactSchema = ContactSchema.fromDbModel(contact)
      const now = Date.now()

      // Skip requestContact if type is ME
      if (type === ContactType.ME) {
        return contactSchema
      }

      // Check if profile is expired (24 hours)
      if (!contactSchema.profileExpiresAt || contactSchema.profileExpiresAt < now) {
        // Profile expired, request full profile
        if (client) {
          this.requestContact({
            client,
            db,
            contact: contactSchema,
            requestType: 'full',
            version: version ?? '0'
          }).catch((e) => {
            logger.error('Failed to request contact:', e)
          })
        }
      }

      return contactSchema
    }

    // Create default contact if not found
    const defaultContact: IContactSchema = {
      address: address,
      type: type ?? ContactType.STRANGER
    }

    const newContact = new ContactSchema(defaultContact)
    try {
      await contactDb.insert(newContact.toDbModel())
    } catch (e) {
      if (e instanceof Dexie.DexieError) {
        if (e.name === 'ConstraintError') {
          logger.debug('Contact already exists:', e)
          const existingContact = await contactDb.getContactByAddress(address)
          return existingContact ? ContactSchema.fromDbModel(existingContact) : null
        }
      }
    }
    // Request full profile for new contact, skip if type is ME
    if (client && type !== ContactType.ME) {
      await this.requestContact({
        client,
        db,
        contact: newContact,
        requestType: 'full',
        version: version ?? '0'
      })
    }

    return newContact
  }

  static async updateContact({ db, contact }: { db: Dexie; contact: Partial<IContactSchema> }): Promise<void> {
    if (!db) return
    try {
      const contactDb = new ContactDb(db)
      const existingContact = await contactDb.getContactByAddress(contact.address)

      if (!existingContact) {
        throw new Error('Contact not found')
      }

      // Check if avatar field has changed
      if (contact.avatar && contact.avatar !== existingContact.avatar) {
        // If old avatar exists, delete the corresponding cache
        if (existingContact.avatar) {
          const cacheDb = new CacheDb(db)
          try {
            await cacheDb.delete(existingContact.avatar)
          } catch (e) {
            logger.error('Failed to delete old avatar cache:', e)
          }
        }
      }

      // Convert the partial contact to a ContactSchema with existing data
      const updatedContact = new ContactSchema({
        id: existingContact.id, // Preserve the original ID
        ...ContactSchema.fromDbModel(existingContact),
        ...contact,
        profileVersion: contact.profileVersion ?? uuidv4() // Only generate new profileVersion if not provided
      })

      // Update the contact in the database
      await contactDb.update(updatedContact.toDbModel())
    } catch (e) {
      logger.error('Failed to update contact:', e)
      throw e
    }
  }

  static async requestContact({
    client,
    db,
    address,
    contact,
    requestType,
    version
  }: {
    client: MultiClient
    db: Dexie
    address?: string
    contact?: IContactSchema
    requestType?: 'header' | 'full'
    version?: string
  }): Promise<void> {
    if (!db) return

    // If no requestType specified, determine based on contact existence and expiration
    if (!requestType) {
      if (!contact) {
        // If no contact provided, try to get from database
        if (!address) {
          throw new Error('Either contact or address must be provided')
        }
        const contactDb = new ContactDb(db)
        const dbContact = await contactDb.getContactByAddress(address)

        if (!dbContact) {
          // No contact exists, request full profile
          requestType = 'full'
        } else {
          const now = Date.now()
          const contactSchema = ContactSchema.fromDbModel(dbContact)

          // Check if profile is expired (24 hours)
          if (!contactSchema.profileExpiresAt || contactSchema.profileExpiresAt < now) {
            requestType = 'full'
          } else {
            // Profile not expired, request header to check version
            requestType = 'header'
          }
        }
      } else {
        // Contact provided, check expiration
        const now = Date.now()
        if (!contact.profileExpiresAt || contact.profileExpiresAt < now) {
          requestType = 'full'
        } else {
          requestType = 'header'
        }
      }
    }

    // Send contact request
    const targetAddress = contact?.address ?? address
    if (!targetAddress) {
      throw new Error('No target address available')
    }

    const payload = MessageService.createContactRequestPayload({
      requestType,
      version: version ?? '0'
    })

    try {
      logger.debug('Sending contact request to', targetAddress, payload)
      await client.send(targetAddress, JSON.stringify(payload), { ...sendOptions })

      // Update expiration time after successful request
      const contactDb = new ContactDb(db)
      const existingContact = await contactDb.getContactByAddress(targetAddress)
      if (existingContact) {
        await this.updateContact({
          db,
          contact: {
            address: targetAddress,
            profileExpiresAt: Date.now() + PROFILE_EXPIRATION_MS
          }
        })
      }
    } catch (e) {
      logger.error('Failed to send contact request:', e)
      throw e
    }
  }

  static async responseContact({
    client,
    db,
    address,
    requestType,
    version
  }: {
    client: MultiClient
    db: Dexie
    address: string
    requestType: 'header' | 'full'
    version?: string
  }): Promise<void> {
    if (!db) return

    try {
      const contactDb = new ContactDb(db)
      const myContact = await contactDb.getContactByAddress(client.addr)

      if (!myContact) {
        throw new Error('My contact not found')
      }

      const contactSchema = ContactSchema.fromDbModel(myContact)
      const now = Date.now()

      // Get avatar data if exists
      let avatarData = undefined
      if (contactSchema.avatar) {
        const cacheDb = new CacheDb(db)
        const avatarCache = await cacheDb.get(contactSchema.avatar)
        if (avatarCache?.source) {
          const arrayBuffer = await avatarCache.source.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString('base64')
          avatarData = {
            type: 'base64' as const,
            data: base64,
            ext: 'png'
          }
        }
      }

      // Create response payload
      const payload = MessageService.createContactResponsePayload({
        name: contactSchema.firstName ?? '',
        avatar: avatarData ?? {
          type: 'base64',
          data: '',
          ext: 'png'
        },
        responseType: requestType,
        version: version ?? contactSchema.profileVersion ?? '0'
      })

      // Send response
      logger.debug('Sending contact response to', address, payload)
      await client.send(address, JSON.stringify(payload), { ...sendOptions })
    } catch (e) {
      logger.error('Failed to send contact response:', e)
      throw e
    }
  }

  static async receiveContactRequest({
    client,
    db,
    address,
    payload
  }: {
    client: MultiClient
    db: Dexie
    address: string
    payload: IPayloadSchema & {
      requestType: string
      version: string
    }
  }): Promise<void> {
    if (!db) return

    try {
      // Respond to the request
      await this.responseContact({
        client,
        db,
        address,
        requestType: payload.requestType as 'header' | 'full'
      })

      logger.debug('Contact request processed:', address, payload.requestType)
    } catch (e) {
      logger.error('Failed to process contact request:', e)
      throw e
    }
  }

  static async receiveContactResponse({
    client,
    db,
    address,
    payload
  }: {
    client: MultiClient
    db: Dexie
    address: string
    payload: IPayloadSchema & {
      responseType: string
      version: string
      content: {
        avatar: {
          type: string
          data: string
          ext: string
        }
        name: string
      }
    }
  }): Promise<void> {
    if (!db) return
    try {
      const contactDb = new ContactDb(db)
      const existingContact = await contactDb.getContactByAddress(address)
      const now = Date.now()

      if (payload.responseType === 'header') {
        // For header response, check version and update expiration
        if (existingContact) {
          const contactSchema = ContactSchema.fromDbModel(existingContact)
          const isVersionDifferent = contactSchema.profileVersion !== payload.version

          if (isVersionDifferent) {
            // Request full profile if version is different
            logger.debug('Version different, requesting full profile:', {
              address,
              currentVersion: contactSchema.profileVersion,
              newVersion: payload.version
            })
            await this.requestContact({
              client,
              db,
              address,
              requestType: 'full'
            })
            return
          } else {
            // Version matches, just update expiration time
            await this.updateContact({
              db,
              contact: {
                address,
                profileExpiresAt: now + PROFILE_EXPIRATION_MS
              }
            })
          }
        } else {
          // No existing contact, request full profile
          logger.debug('No existing contact, requesting full profile:', address)
          await this.requestContact({
            client,
            db,
            address,
            requestType: 'full'
          })
          return
        }
      } else {
        const firstName = payload.content.name

        // Prepare contact data
        const contactData: Partial<IContactSchema> = {
          address,
          firstName,
          profileVersion: payload.version,
          profileExpiresAt: now + PROFILE_EXPIRATION_MS
        }

        // Handle avatar if present
        if (payload.content.avatar) {
          const { type, data, ext } = payload.content.avatar
          if (type === 'base64') {
            // Generate a unique filename for the avatar
            const avatarId = `${address}_${payload.version}.${ext}`
            contactData.avatar = avatarId

            // Save avatar to cache
            const cacheDb = new CacheDb(db)
            try {
              const imageData = Buffer.from(data, 'base64')
              const cachedAvatarId = await cacheDb.add({
                type: MediaType.IMAGE,
                mimeType: `image/${ext}`,
                name: avatarId,
                size: imageData.length,
                source: new Blob([imageData], { type: `image/${ext}` }),
                createdAt: now,
                lastAccessed: now
              })
              contactData.avatar = cachedAvatarId
            } catch (e) {
              logger.error('Failed to save avatar to cache:', e)
            }
          }
        }

        if (existingContact) {
          // Update existing contact
          await this.updateContact({ db, contact: contactData })
        } else {
          // Create new contact
          const newContact = new ContactSchema({
            ...contactData,
            type: ContactType.STRANGER
          } as IContactSchema)
          await contactDb.insert(newContact.toDbModel())
        }
      }

      logger.debug('Contact response processed:', address, payload.responseType)
    } catch (e) {
      logger.error('Failed to process contact response:', e)
      throw e
    }
  }
}
