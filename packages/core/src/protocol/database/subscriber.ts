import Dexie from 'dexie'
import { logger } from '../../utils/log'

export interface SubscriberDbModel {
  id?: number
  created_at: number
  updated_at?: number
  topic_id: string
  contact_address: string
  status: number
  data?: string
}

export interface ISubscriberDb {
  insert(model: SubscriberDbModel): Promise<void>

  update(model: SubscriberDbModel): Promise<void>
}

export class SubscriberDb implements ISubscriberDb {
  static tableName = 'subscribers'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  insert(model: SubscriberDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }

  update(model: SubscriberDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }
}
