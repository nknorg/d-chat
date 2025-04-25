import Dexie from 'dexie'
import { logger } from '../../utils/log'

export interface SubscriberDbModel {
  id?: number
  created_at: number
  updated_at?: number
  topic: string
  contact_address: string
  status: number
  data?: string
}

export interface ISubscriberDb {
  insert(model: SubscriberDbModel): Promise<void>
  update(model: SubscriberDbModel): Promise<void>
  getByTopic(topic: string): Promise<SubscriberDbModel[]>
  delete(id: number): Promise<void>
  deleteByTopicAndContactAddress(topic: string, contactAddress: string): Promise<void>
}

export class SubscriberDb implements ISubscriberDb {
  static tableName = 'subscribers'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  async insert(model: SubscriberDbModel): Promise<void> {
    try {
      await this.db.table(SubscriberDb.tableName).add(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async update(model: SubscriberDbModel): Promise<void> {
    try {
      await this.db.table(SubscriberDb.tableName).put(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getByTopic(topic: string): Promise<SubscriberDbModel[]> {
    try {
      return await this.db.table(SubscriberDb.tableName).where('topic').equals(topic).toArray()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.table(SubscriberDb.tableName).delete(id)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async deleteByTopicAndContactAddress(topic: string, contactAddress: string): Promise<void> {
    try {
      await this.db.table(SubscriberDb.tableName)
        .where(['topic', 'contact_address'])
        .equals([topic, contactAddress])
        .delete()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }
}
