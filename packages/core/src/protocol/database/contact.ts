import Dexie from 'dexie'
import { logger } from '../../utils/log'

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
  remark_name?: string
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
      return await this.db.table(ContactDb.tableName).where('address').equals(address).first() || null
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  async insert(model: ContactDbModel): Promise<void> {
    try {
      await this.db.table(ContactDb.tableName).add(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async update(model: ContactDbModel): Promise<void> {
    try {
      await this.db.table(ContactDb.tableName).put(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }
}
