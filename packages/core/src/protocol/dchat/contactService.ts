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

  static async getOrCreateContact({ client, db, address, type }: { client?: MultiClient; db: Dexie; address: string; type?: ContactType }): Promise<ContactSchema | null> {
    if (!address || !db) return null

    const contactDb = new ContactDb(db)
    const contact = await contactDb.getContactByAddress(address)

    if (contact) {
      const contactSchema = ContactSchema.fromDbModel(contact)
      const now = Date.now()

      // Check if profile is expired (24 hours)
      if (!contactSchema.profileExpiresAt || contactSchema.profileExpiresAt < now) {
        // Profile expired, request full profile
        if (client) {
          this.requestContact({
            client,
            db,
            contact: contactSchema,
            requestType: 'full'
          }).catch((e) => {
            logger.error('Failed to request contact:', e)
          })
        }
      } else {
        // Profile not expired, request header to check version
        if (client) {
          this.requestContact({
            client,
            db,
            contact: contactSchema,
            requestType: 'header'
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
    await contactDb.insert(newContact.toDbModel())

    // Request full profile for new contact
    if (client) {
      await this.requestContact({
        client,
        db,
        contact: newContact,
        requestType: 'full'
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
      version: version ?? contact?.profileVersion ?? '0'
    })

    try {
      logger.debug('Sending contact request to', targetAddress, payload)
      await client.send(targetAddress, JSON.stringify(payload), { ...sendOptions })
    } catch (e) {
      logger.error('Failed to send contact request:', e)
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
        // For header response, only check version and expiration
        if (existingContact) {
          const contactSchema = ContactSchema.fromDbModel(existingContact)
          const isExpired = !contactSchema.profileExpiresAt || contactSchema.profileExpiresAt < now
          const isVersionDifferent = contactSchema.profileVersion !== payload.version

          if (isExpired || isVersionDifferent) {
            // Request full profile if expired or version is different
            logger.debug('Profile expired or version different, requesting full profile:', {
              address,
              currentVersion: contactSchema.profileVersion,
              newVersion: payload.version,
              isExpired
            })
            await this.requestContact({
              client,
              db,
              address,
              requestType: 'full'
            })
            return
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
