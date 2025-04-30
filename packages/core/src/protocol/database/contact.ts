import Dexie from 'dexie'
import { logger } from '../../utils/log'
import { Wallet } from 'nkn-sdk'
import { ContactType } from '../../schema/contactEnum'

export interface ContactDbModel {
  id?: number
  created_at?: number
  updated_at?: number
  address: string
  wallet_address: string
  type?: number
  avatar?: string
  first_name?: string
  last_name?: string
  profile_version?: string
  profile_expires_at?: number
  options?: string
  data?: string
}

export interface IContactDb {
  insert(model: ContactDbModel): Promise<void>

  update(model: ContactDbModel): Promise<void>

  getContactByAddress(address: string): Promise<ContactDbModel | null>
}

export class ContactDb implements IContactDb {
  static tableName = 'contacts'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  async getContactByAddress(address: string): Promise<ContactDbModel | null> {
    try {
      return (await this.db.table(ContactDb.tableName).where('address').equals(address).first()) || null
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  async insert(model: ContactDbModel): Promise<void> {
    try {
      const now = Date.now()
      model.created_at = now
      model.updated_at = now

      if (model.wallet_address == null) {
        model.wallet_address = Wallet.publicKeyToAddress(model.address)
      }

      if (model.type == null) {
        model.type = ContactType.STRANGER
      }

      await this.db.table(ContactDb.tableName).add(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async update(model: ContactDbModel): Promise<void> {
    try {
      model.updated_at = Date.now()
      const existingModel = await this.db.table(ContactDb.tableName).get(model.id)
      if (!existingModel) {
        throw new Error('Contact not found')
      }

      // Only update fields that are provided in the model
      const updates: Partial<ContactDbModel> = {}
      for (const key in model) {
        if (model[key] !== undefined) {
          updates[key] = model[key]
        }
      }

      await this.db.table(ContactDb.tableName).update(model.id, updates)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }
}
