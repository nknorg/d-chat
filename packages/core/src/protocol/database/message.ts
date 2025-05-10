import Dexie from 'dexie'
import { SessionType } from '../../schema/sessionEnum'
import { logger } from '../../utils/log'
import { MessageStatus } from '../../schema/messageEnum'

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

  queryByPayloadIds(payloadIds: string[]): Promise<MessageDbModel[]>

  batchUpdateStatus(messages: MessageDbModel[]): Promise<void>

  queryByTargetId(
    targetId: string,
    targetType: SessionType,
    options: {
      isOutbound?: boolean
      status?: number
      isDelete?: boolean
      offset?: number
      limit?: number
    }
  ): Promise<MessageDbModel[]>

  getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    options: {
      offset?: number
      limit?: number
    }
  ): Promise<MessageDbModel[]>

  updateStatusByTargetId(targetId: string, targetType: SessionType, status: number): Promise<void>

  updateReceivedMessagesStatusByTargetId(targetId: string, targetType: SessionType, status: number): Promise<void>

  updateStatusByPayloadId(payloadId: string, status: number): Promise<void>

  getUnreadMessages(targetId: string, targetType: SessionType): Promise<MessageDbModel[]>

  getUnreadMessageCount(): Promise<number>

  markMessagesAsDeleted(targetId: string, targetType: SessionType): Promise<void>
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
      offset?: number
      limit?: number
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

    if (options.offset !== undefined) {
      query = query.offset(options.offset)
    }

    if (options.limit !== undefined) {
      query = query.limit(options.limit)
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
    options: {
      offset?: number
      limit?: number
    } = {
      offset: 0,
      limit: 50
    }
  ): Promise<MessageDbModel[]> {
    const query = this.db
      .table(MessageDb.tableName)
      .where('[target_id+target_type+is_delete+sent_at]')
      .between([targetId, targetType, 0, Dexie.minKey], [targetId, targetType, 0, Dexie.maxKey], true, true)
      .reverse()
      .offset(options.offset)
      .limit(options.limit)

    return query.toArray()
  }

  async updateStatusByTargetId(targetId: string, targetType: SessionType, status: number): Promise<void> {
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

  async queryByPayloadIds(payloadIds: string[]): Promise<MessageDbModel[]> {
    try {
      return await this.db.table(MessageDb.tableName)
        .where('payload_id')
        .anyOf(payloadIds)
        .toArray()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async batchUpdateStatus(messages: MessageDbModel[]): Promise<void> {
    try {
      await this.db.transaction('rw', MessageDb.tableName, async () => {
        for (const message of messages) {
          await this.db.table(MessageDb.tableName).put(message)
        }
      })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async updateReceivedMessagesStatusByTargetId(targetId: string, targetType: SessionType, status: number): Promise<void> {
    try {
      await this.db.table(MessageDb.tableName)
        .where(['target_id', 'target_type', 'is_outbound'])
        .equals([targetId, targetType, 0])
        .modify((item) => {
          item.status = item.status | status
        })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async updateStatusByPayloadId(payloadId: string, status: number): Promise<void> {
    try {
      await this.db
        .table(MessageDb.tableName)
        .where('payload_id')
        .equals(payloadId)
        .modify((item) => {
          item.status = item.status | status
        })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getUnreadMessages(targetId: string, targetType: SessionType): Promise<MessageDbModel[]> {
    try {
      return await this.db
        .table(MessageDb.tableName)
        .where(['target_id', 'target_type', 'is_outbound', 'is_delete'])
        .equals([targetId, targetType, 0, 0])
        .and((item) => item.status < MessageStatus.Read)
        .toArray()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getUnreadMessageCount(): Promise<number> {
    try {
      return await this.db.table(MessageDb.tableName)
        .where('is_delete')
        .equals(0)
        .and((item) => item.status < MessageStatus.Read)
        .count()
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async updateWithTransaction(message: MessageDbModel): Promise<MessageDbModel | undefined> {
    try {
      return await this.db.transaction('rw', MessageDb.tableName, async () => {
        const existingMessage = await this.queryByPayloadId(message.payload_id)
        if (existingMessage) {
          existingMessage.status = existingMessage.status | message.status
          existingMessage.received_at = message.received_at
          await this.update(existingMessage)
          return existingMessage
        }
        return undefined
      })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async batchUpdateStatusWithTransaction(messages: MessageDbModel[]): Promise<MessageDbModel[]> {
    try {
      return await this.db.transaction('rw', MessageDb.tableName, async () => {
        const existingMessages = await this.queryByPayloadIds(messages.map(m => m.payload_id))
        if (existingMessages.length > 0) {
          for (const message of existingMessages) {
            const updateMessage = messages.find(m => m.payload_id === message.payload_id)
            if (updateMessage) {
              message.status = message.status | updateMessage.status
            }
          }
          await this.batchUpdateStatus(existingMessages)
          return existingMessages
        }
        return []
      })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async markMessagesAsDeleted(targetId: string, targetType: SessionType): Promise<void> {
    try {
      await this.db
        .table(MessageDb.tableName)
        .where(['target_id', 'target_type'])
        .equals([targetId, targetType])
        .modify((item) => {
          item.is_delete = 1
          item.deleted_at = Date.now()
        })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }
}
