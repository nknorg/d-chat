import Dexie from 'dexie'
import { logger } from '../../utils/log'

export interface TopicDbModel {
  id?: number
  created_at: number
  updated_at?: number
  topic: string
  joined: number
  subscribe_at?: number
  expire_height?: number
  avatar?: string
  count: number
  options?: string
  data?: string
}

export interface ITopicDb {
  insert(model: TopicDbModel): Promise<void>

  update(model: TopicDbModel): Promise<void>

  getByTopic(topic: string): Promise<TopicDbModel | null>

  put(model: TopicDbModel): Promise<void>
}

export class TopicDb implements ITopicDb {
  static tableName = 'topics'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  insert(model: TopicDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }

  update(model: TopicDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }

  async getByTopic(topic: string): Promise<TopicDbModel | null> {
    return await this.db.table(TopicDb.tableName).where('topic').equals(topic).first()
  }

  async put(model: TopicDbModel): Promise<void> {
    try {
      if (!model.topic) {
        throw new Error('Topic is required')
      }

      const now = Date.now()
      if (!model.created_at) {
        model.created_at = now
      }
      model.updated_at = now

      await this.db.table(TopicDb.tableName).put(model)
    } catch (e) {
      logger.error(`Failed to put topic: ${e}`)
      throw e
    }
  }
}
