import Dexie from 'dexie'

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
  insert(model: ContactDbModel): Promise<boolean>

  getContactByAddress(address: string): Promise<ContactDbModel | null>

  update(model: ContactDbModel): Promise<void>
}

export class ContactDb implements IContactDb {
  static tableName = 'contacts'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  getContactByAddress(address: string): Promise<ContactDbModel | null> {
    return Promise.resolve(undefined)
  }

  insert(model: ContactDbModel): Promise<boolean> {
    return Promise.resolve(false)
  }

  update(model: ContactDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }
}
