import Dexie from 'dexie'
import { SessionType } from '../../schema/sessionEnum'
import { logger } from '../../utils/log'

export interface MessageDbModel {
  id?: number
  message_id?: string
  queue_id?: number
  device_id?: string
  sender: string
  receiver: string
  target_id: string
  target_type: number
  payload: string
  payload_id: string
  payload_type: string
  payload_content: string
  payload_options: string
  status?: number
  is_outbound?: number
  sent_at?: number
  received_at?: number
  is_delete?: number
  deleted_at?: number
}

export interface IMessageDb {
  insert(model: MessageDbModel): Promise<void>

  update(model: MessageDbModel): Promise<void>

  queryByMessageId(messageId: string): Promise<MessageDbModel | undefined>

  queryByPayloadId(payloadId: string): Promise<MessageDbModel | undefined>

  queryByTargetId(
    targetId: string,
    targetType: SessionType,
    options: {
      isOutbound?: boolean
      status?: number
      isDelete?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<MessageDbModel[]>

  getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    limit?: number,
    skip?: number
  ): Promise<MessageDbModel[]>

  updateStatusByTargetId(targetId: string, targetType: SessionType, status: number): Promise<void>
}

export class MessageDb implements IMessageDb {
  static tableName = 'messages'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  async insert(model: MessageDbModel): Promise<void> {
    try {
      await this.db.table(MessageDb.tableName).add(model)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  queryByMessageId(messageId: string): Promise<MessageDbModel | undefined> {
    try {
      return this.db.table(MessageDb.tableName).where('message_id').equals(messageId).first()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  queryByPayloadId(payloadId: string): Promise<MessageDbModel | undefined> {
    try {
      return this.db.table(MessageDb.tableName).where('payload_id').equals(payloadId).first()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  queryByTargetId(
    targetId: string,
    targetType: SessionType,
    options: {
      isOutbound?: boolean
      status?: number
      isDelete?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<MessageDbModel[]> {
    let query = this.db
      .table(MessageDb.tableName)
      .where('target_id')
      .equals(targetId)
      .and((item) => item.target_type === targetType)
      .and((item) => item.is_delete === !!options.isDelete)

    if (options.isOutbound !== undefined) {
      query = query.and((item) => item.is_outbound === options.isOutbound)
    }

    if (options.status !== undefined) {
      query = query.and((item) => item.status === options.status)
    }

    if (options.limit !== undefined) {
      query = query.limit(options.limit)
    }

    if (options.offset !== undefined) {
      query = query.offset(options.offset)
    }

    return query.toArray()
  }

  async update(model: MessageDbModel): Promise<void> {
    this.db.table(MessageDb.tableName).put(model)
    return
  }

  async getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    limit: number = 20,
    skip: number = 0
  ): Promise<MessageDbModel[]> {
    const query = this.db
      .table(MessageDb.tableName)
      .where('[target_id+target_type+is_delete+sent_at]')
      .between([targetId, targetType, 0, Dexie.minKey], [targetId, targetType, 0, Dexie.maxKey])
      .reverse()
      .limit(limit)
      .offset(skip)

    return query.toArray()
  }

  async updateStatusByTargetId(
    targetId: string,
    targetType: SessionType,
    status: number
  ): Promise<void> {
    try {
      await this.db
        .table(MessageDb.tableName)
        .where(['target_id', 'target_type'])
        .equals([targetId, targetType])
        .modify((item) => {
          item.status = item.status | status
        })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }
}
