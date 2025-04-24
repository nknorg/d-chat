import Dexie from 'dexie'
import { logger } from '../../utils/log'

export interface TopicDbModel {
  id?: number
  created_at: number
  updated_at?: number
  topic_id: string
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
}
