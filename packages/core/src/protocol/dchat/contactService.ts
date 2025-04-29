import { IContactSchema, ContactSchema } from '../../schema/contact'
import { ContactType } from '../../schema/contactEnum'
import { ContactDb } from '../database/contact'
import Dexie from 'dexie'
import { logger } from '../../utils/log'
import { CacheDb } from '../database/cache'

export class ContactService {
  static getNickName(contact: IContactSchema): string {
    if (contact == null) return ''
    if (contact.lastName != null && contact.lastName.length > 0) {
      return contact.lastName
    }
    const index = contact.address.lastIndexOf('.')
    if (index < 0) {
      return contact.address.substring(0, 6)
    } else if (contact.address.length > index + 7) {
      return contact.address.substring(0, index + 7)
    } else {
      return contact.address
    }
  }

  static async getOrCreateContact({ db, address, type }: { db: Dexie; address: string; type?: ContactType }): Promise<ContactSchema | null> {
    if (!address || !db) return null

    const contactDb = new ContactDb(db)
    const contact = await contactDb.getContactByAddress(address)

    if (contact) {
      return ContactSchema.fromDbModel(contact)
    }

    // Create default contact if not found
    const defaultContact: IContactSchema = {
      address: address,
      type: type ?? ContactType.STRANGER
    }

    const newContact = new ContactSchema(defaultContact)
    await contactDb.insert(newContact.toDbModel())

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
        ...contact
      })

      // Update the contact in the database
      await contactDb.update(updatedContact.toDbModel())
    } catch (e) {
      logger.error('Failed to update contact:', e)
      throw e
    }
  }
}
