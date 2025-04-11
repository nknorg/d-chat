import { Message, MultiClient } from 'nkn-sdk'
import { Connect } from '../../chat/connect'
import { MessageSchema } from '../../schema/message'
import { MessageContentType, MessageStatus, PayloadType } from '../../schema/messageEnum'
import { PayloadSchema } from '../../schema/payload'
import { SessionSchema } from '../../schema/session'
import { SessionType } from '../../schema/sessionEnum'
import { StoreAdapter } from '../../store/storeAdapter'
import { genChannelId } from '../../utils/hash'
import { logger } from '../../utils/log'
import { AddMessageHandler, ChatProtocol, UpdateSessionHandler } from '../ChatProtocol'
import { MessageDb } from '../database/message'
import { SessionDb } from '../database/session'
import { MessageService } from './messageService'

export class Dchat implements ChatProtocol {
  private client: MultiClient
  private db: any
  private _deviceId: string

  private blockHeightTopicSubscribeDefault = 400000 // 93days
  private sendOptions = { noReply: true, msgHoldingSeconds: 8640000 }
  private _currentChatTargetId?: string

  private _addMessage?: AddMessageHandler
  private _updateSession?: UpdateSessionHandler

  constructor() {}

  init() {
    this.client = Connect.getLastSignClient()
    this.db = StoreAdapter.db?.getLastOpenedDb()
  }

  setDeviceId(deviceId: string): void {
    this._deviceId = deviceId
  }

  getDeviceId(): string {
    return this._deviceId
  }

  async receiveText(message: MessageSchema) {
    // const messageDb = new MessageDb(this.db)
    // const msgRecord = await messageDb.queryByMsgId(message.msgId)
    // if (!msgRecord) {
    //   const ok = await messageDb.insert(message.toDbModel())
    // }
  }

  async receiveImage(message: MessageSchema) {
    // const messageDb = new MessageDb(this.db)
    // const msgRecord = await messageDb.queryByMsgId(message.msgId)
    // if (!msgRecord) {
    //   const ok = await messageDb.insert(message.toDbModel())
    // }
  }

  async receiveReceiptMessage(payloadId: string) {
    // TODO: handle receipt message
  }

  async handleContactMessage(message: MessageSchema) {}

  async handleMessage(raw: Message) {
    if (raw.payloadType == PayloadType.TEXT) {
      let data: any
      try {
        data = JSON.parse(<string>raw.payload)
      } catch (e) {
        logger.error(e)
      }

      if (data == null || data.id == null || data.contentType == null) {
        return
      }

      const payload = new PayloadSchema(data)
      let sessionType = 0
      let messageStatus = MessageStatus.Error

      switch (payload.contentType) {
        case MessageContentType.receipt:
          messageStatus = MessageStatus.Receipt
          this.receiveReceiptMessage(data['targetID'])
          return
        case MessageContentType.read:
          // TODO: handle read receipt
          return
        case MessageContentType.text:
        case MessageContentType.image:
        case MessageContentType.video:
        case MessageContentType.file:
          this.receipt(raw.src, payload.id)
          sessionType = SessionType.CONTACT
          messageStatus = MessageStatus.Sent | MessageStatus.Receipt
          break
        default:
          logger.error('not support message type')
          return
      }

      if (sessionType == 0) {
        logger.error('sessionType is not processed')
        return
      }

      // TODO: d-chat protocol
      // await this.handleContactMessage(message)

      const message = MessageSchema.fromRawMessage(raw, raw.src, this.client.addr)
      const record = await this.saveMessage(message)
      if (record != null) {
        this._addMessage?.(record)
        await this.handleSession(record)
      }
    }
  }

  async handleSession(message: MessageSchema) {
    const targetType = message.targetType
    const targetId = message.targetId
    // unread count
    const inSessionPage = this._currentChatTargetId === targetId
    let unreadCount = message.isOutbound ? 0 : 1
    unreadCount = inSessionPage ? 0 : unreadCount

    const session = new SessionSchema({
      targetId: targetId,
      targetType: targetType,
      lastMessageOutbound: message.isOutbound,
      lastMessageAt: message.sentAt,
      lastMessagePayload: message.payload,
      lastMessageOptions: message.payload.options,
      isTop: false,
      unReadCount: unreadCount
    })
    const record = await this.saveSession(session)
    if (record != null) {
      this._updateSession?.(record)
    }
  }

  setCurrentChatTargetId(targetId: string) {
    this._currentChatTargetId = targetId
  }

  getCurrentChatTargetId() {
    return this._currentChatTargetId
  }

  async receipt(to: string, msgId: string) {
    // TODO: handle receipt message
  }

  set addMessage(handler: AddMessageHandler) {
    this._addMessage = handler
  }

  get addMessage() {
    return this._addMessage
  }

  set updateSession(handler: UpdateSessionHandler) {
    this._updateSession = handler
  }

  get updateSession() {
    return this._updateSession
  }

  async saveMessage(message: MessageSchema): Promise<MessageSchema | null> {
    if (!this.db) return message
    try {
      const messageDb = new MessageDb(this.db)
      const messRecord = await messageDb.queryByPayloadId(message.payload.id)
      if (messRecord) {
        return null
      }
      await messageDb.insert(message.toDbModel())
      return message
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  async saveSession(session: SessionSchema): Promise<SessionSchema | null> {
    if (!this.db) return session
    const now = Date.now()
    try {
      const sessionDb = new SessionDb(this.db)
      const sessRecord = await sessionDb.query(session.targetId, session.targetType)
      if (sessRecord) {
        sessRecord.last_message_at = session.lastMessageAt ?? now
        sessRecord.last_message_payload = session.lastMessagePayload.toData()
        sessRecord.last_message_options = JSON.stringify(session.lastMessageOptions)
        sessRecord.un_read_count = sessRecord.un_read_count + session.unReadCount
        session.unReadCount = sessRecord.un_read_count
        sessRecord.last_message_outbound = session.lastMessageOutbound ? 1 : 0
        await sessionDb.update(sessRecord)
        return session
      }
      await sessionDb.insert(session.toDbModel())
      return session
    } catch (e) {
      logger.error(e)
      return null
    }
  }

  async sendText(type: SessionType, to: string, msg: string): Promise<MessageSchema> {
    const payload = new PayloadSchema(
      MessageService.createTextPayload(msg, { deviceId: this._deviceId })
    )
    if (type == SessionType.TOPIC) {
      payload.topic = to
    } else if (type == SessionType.PRIVATE_GROUP) {
      payload.groupId = to
    }

    const message = new MessageSchema({
      deviceId: this._deviceId ?? '',
      isOutbound: true,
      messageId: MessageService.createMessageId(),
      payload: payload,
      receiver: to,
      sender: this.client.addr,
      sentAt: payload.timestamp,
      status: MessageStatus.Sending,
      targetId: to,
      targetType: type
    })

    let dest = [to]
    if (type == SessionType.TOPIC) {
      // todo subscribes in cache
      const subs = await this.client.getSubscribers(await genChannelId(to), {
        limit: 1000,
        offset: 0,
        meta: false,
        txPool: true
      })
      dest = [...(<string[]>subs.subscribers), ...(<string[]>subs.subscribersInTxPool)]
      logger.debug('topic subscribers', dest)
      try {
        await this.client.send(dest, message.payload.toData(), {
          ...this.sendOptions,
          messageId: message.messageId
        })
        message.status = MessageStatus.Sent
      } catch (e) {
        logger.error(e)
      }
    } else {
      try {
        logger.debug(`send message to: ${to}, payload:`, message.payload.toData())
        await this.client.send(dest, message.payload.toData(), {
          ...this.sendOptions,
          messageId: message.messageId
        })
        message.status = MessageStatus.Sent
      } catch (e) {
        logger.error(e)
      }
    }

    const record = await this.saveMessage(message)
    if (record != null) {
      this._addMessage?.(record)
      await this.handleSession(record)
    }
    return message
  }

  async getSessionList(limit: number = 20, skip: number = 0): Promise<SessionSchema[]> {
    try {
      const sessionDb = new SessionDb(this.db)
      const list = await sessionDb.queryListRecent(limit, skip)
      if (list) {
        return list.map((item) => SessionSchema.fromDbModel(item))
      }
    } catch (e) {
      logger.error(e)
    }
    return null
  }

  async getSessionByTargetId(
    targetId: string,
    targetType: SessionType = SessionType.CONTACT
  ): Promise<SessionSchema | null> {
    try {
      const sessionDb = new SessionDb(this.db)
      const record = await sessionDb.query(targetId, targetType)
      if (record) {
        return SessionSchema.fromDbModel(record)
      }
    } catch (e) {
      logger.error(e)
    }
    return null
  }

  async getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    limit: number = 20,
    skip: number = 0
  ): Promise<MessageSchema[]> {
    try {
      const messageDb = new MessageDb(this.db)
      const list = await messageDb.getHistoryMessages(targetId, targetType, limit, skip)
      if (list) {
        return list.map((item) => MessageSchema.fromDbModel(item))
      }
    } catch (e) {
      logger.error(e)
    }
    return null
  }

  async readAllMessagesByTargetId(targetId: string, targetType: SessionType): Promise<void> {
    try {
      const messageDb = new MessageDb(this.db)
      await messageDb.updateStatusByTargetId(targetId, targetType, MessageStatus.Read)
      const sessionDb = new SessionDb(this.db)
      const record = await sessionDb.query(targetId, targetType)
      record.un_read_count = 0
      await sessionDb.update(record)
    } catch (e) {
      logger.error(e)
    }
  }
}
