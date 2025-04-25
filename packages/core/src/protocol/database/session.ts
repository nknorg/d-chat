import Dexie from 'dexie'
import { logger } from '../../utils/log'

export interface SessionDbModel {
  id?: number
  target_id: string
  target_type: number
  last_message_outbound: number
  last_message_at?: number
  last_message_payload?: string
  last_message_options?: string
  un_read_count: number
  is_top?: number
}

export interface ISessionDb {
  queryListRecent(limit?: number, offset?: number): Promise<SessionDbModel[] | null>

  insert(model: SessionDbModel): Promise<void>

  update(model: SessionDbModel): Promise<void>

  updateLastMessage(model: SessionDbModel): Promise<void>

  query(targetId: string, targetType: number): Promise<SessionDbModel | null>

  queryByTargetId(targetId: string): Promise<SessionDbModel | null>
}

export class SessionDb implements ISessionDb {
  static tableName = 'sessions'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  async insert(model: SessionDbModel): Promise<void> {
    try {
      await this.db.table(SessionDb.tableName).add(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async update(model: SessionDbModel): Promise<void> {
    try {
      await this.db.table(SessionDb.tableName).put(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  query(targetId: string, targetType: number): Promise<SessionDbModel | null> {
    try {
      return this.db
        .table(SessionDb.tableName)
        .where(['target_id', 'target_type'])
        .equals([targetId, targetType])
        .first()
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  queryByTargetId(targetId: string): Promise<SessionDbModel | null> {
    try {
      return this.db
        .table(SessionDb.tableName)
        .where('target_id')
        .equals(targetId)
        .first()
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  queryListRecent(limit?: number, offset?: number): Promise<SessionDbModel[] | null> {
    try {
      let query = this.db
        .table(SessionDb.tableName)
        .orderBy(['is_top', 'last_message_at'])
        .reverse()

      if (offset !== undefined) {
        query = query.offset(offset)
      }

      if (limit !== undefined) {
        query = query.limit(limit)
      }

      return query.toArray()
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  updateLastMessage(model: SessionDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }
}
