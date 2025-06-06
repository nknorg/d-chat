import { Message, MultiClient } from 'nkn-sdk'
import { Connect } from '../../chat/connect'
import { CacheSchema } from '../../schema/cache'
import { ContactSchema, IContactSchema } from '../../schema/contact'
import { ContactType } from '../../schema/contactEnum'
import { MessageSchema } from '../../schema/message'
import { FileType, MessageContentType, MessageStatus, PayloadType } from '../../schema/messageEnum'
import { IPayloadSchema, MediaOptions, PayloadSchema } from '../../schema/payload'
import { SessionSchema } from '../../schema/session'
import { SessionType } from '../../schema/sessionEnum'
import { SubscriberSchema } from '../../schema/subscriber'
import { SubscriberStatus } from '../../schema/subscriberEnum'
import { TopicSchema } from '../../schema/topic'
import { StoreAdapter } from '../../store/storeAdapter'
import { bytesToHex, genChannelId } from '../../utils/hash'
import { logger } from '../../utils/log'
import { AddMessageHandler, ChatProtocol, UpdateMessageHandler, UpdateSessionHandler } from '../ChatProtocol'
import { ContactDb } from '../database/contact'
import { MessageDb } from '../database/message'
import { SessionDb } from '../database/session'
import { SubscriberDb } from '../database/subscriber'
import { TopicDb } from '../database/topic'
import { NknError } from '../error/nknError'
import { CacheService } from './cacheService'
import { ContactService } from './contactService'
import { MessageService, sendOptions } from './messageService'
import { ReedSolomonService } from './reedSolomonService'
import { blockHeightTopicSubscribeDefault, blockHeightTopicWarnBlockExpire, SubscribeService } from './subscribeService'

export class Dchat implements ChatProtocol {
  private client: MultiClient
  private db: any
  private _deviceId: string

  private blockHeightTopicSubscribeDefault = 400000 // 93days
  private _currentChatTargetId?: string

  private _addMessage?: AddMessageHandler
  private _updateMessage?: UpdateMessageHandler
  private _updateSession?: UpdateSessionHandler

  init() {
    this.client = Connect.getLastSignClient()
    this.db = StoreAdapter.db?.getLastOpenedDb()
    logger.debug('init dchat', this.client, this.db)
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
    const fileExt = message.payload.options?.fileExt
    const fileType = message.payload.options?.fileType
    if (fileType == FileType.IMAGE) {
      const base64Data = message.payload.content
      const markdownImage = `![](data:image/${fileExt};base64,${base64Data})`
      message.payload.content = markdownImage

      const record = await this.saveMessage(message, true)
      if (record != null) {
        this._addMessage?.(record)
        await this.handleSession(record)
      }
    }
  }

  async receiveFile(message: MessageSchema) {
    // TODO: receive file
  }

  async receiveReceiptMessage(payloadId: string) {
    try {
      if (!this.db) return
      const messageDb = new MessageDb(this.db)
      const message = await messageDb.queryByPayloadId(payloadId)
      if (message) {
        const updateMessage = {
          ...message,
          status: MessageStatus.Receipt,
          received_at: Date.now()
        }
        const latestMessage = await messageDb.updateWithTransaction(updateMessage)
        if (latestMessage) {
          // Notify frontend of message status update with latest data
          this._updateMessage?.(MessageSchema.fromDbModel(latestMessage))
        }
      }
    } catch (e) {
      logger.error('Failed to handle receipt message:', e)
    }
  }

  async receiveReadMessage(readIds: string[]) {
    try {
      if (!this.db) return
      const messageDb = new MessageDb(this.db)

      // Get all messages in one query
      const messages = await messageDb.queryByPayloadIds(readIds)

      // Update all messages in one transaction
      if (messages.length > 0) {
        const updateMessages = messages.map((message) => ({
          ...message,
          status: MessageStatus.Read
        }))
        const latestMessages = await messageDb.batchUpdateStatusWithTransaction(updateMessages)
        // Notify frontend of message status updates with latest data
        for (const message of latestMessages) {
          this._updateMessage?.(MessageSchema.fromDbModel(message))
        }
      }
    } catch (e) {
      logger.error('Failed to handle read message:', e)
    }
  }

  async receiveTopicSubscribeMessage(src: string, topic: string) {
    const topicDb = new TopicDb(this.db)
    const subscriberDb = new SubscriberDb(this.db)

    try {
      // 1. Add or update subscriber first
      const record = await subscriberDb.getByTopicAndContactAddress(topic, src)
      if (record) {
        record.status = SubscriberStatus.Subscribed
        await subscriberDb.put(record)
      } else {
        const subscriber = new SubscriberSchema({
          topic: topic,
          contactAddress: src,
          status: SubscriberStatus.Subscribed,
          createdAt: Date.now()
        })
        await subscriberDb.put(subscriber.toDbModel())

        // 2. Update topic subscriber count only when adding a new subscriber
        const existingTopic = await topicDb.getByTopic(topic)
        if (existingTopic) {
          existingTopic.count = existingTopic.count + 1
          await topicDb.put(existingTopic)
        }
      }
    } catch (e) {
      logger.error('Failed to handle topic subscribe message:', e)
    }
  }

  async receiveTopicUnsubscribeMessage(src: string, topic: string) {
    const topicDb = new TopicDb(this.db)
    const subscriberDb = new SubscriberDb(this.db)

    try {
      // 1. Check if subscriber exists first
      const record = await subscriberDb.getByTopicAndContactAddress(topic, src)
      if (record) {
        // 2. Remove subscriber
        await subscriberDb.deleteByTopicAndContactAddress(topic, src)

        // 3. Update topic subscriber count and joined status only if subscriber was removed
        const existingTopic = await topicDb.getByTopic(topic)
        if (existingTopic) {
          existingTopic.count = Math.max(0, existingTopic.count - 1)
          // If the unsubscriber is the current user, update joined status
          if (src === this.client.addr) {
            existingTopic.joined = 0
          }
          await topicDb.put(existingTopic)
        }
      }
    } catch (e) {
      logger.error('Failed to handle topic unsubscribe message:', e)
    }
  }

  async receiveContactResponseMessage(
    src: string,
    payload: IPayloadSchema & {
      responseType: string
      version: string
      content: {
        avatar: {
          type: string
          data: string
          ext: string
        }
        name: string
      }
    }
  ) {
    if (!payload.responseType) {
      return
    }
    await ContactService.receiveContactResponse({ client: this.client, db: this.db, address: src, payload })
  }

  async receiveContactRequestMessage(src: string, payload: IPayloadSchema & { requestType: string; version: string }) {
    if (!payload.requestType) {
      return
    }
    await ContactService.receiveContactRequest({ client: this.client, db: this.db, address: src, payload })
  }

  async handleContact(message: MessageSchema) {
    const sender = message.sender
    if (!sender) {
      return
    }

    // Get or create contact
    await this.getOrCreateContact(sender, { type: ContactType.STRANGER })
  }

  async handleTopic(message: MessageSchema) {
    const topic = message.payload.topic
    const sender = message.sender

    // Check if topic needs to be subscribed
    const shouldSubscribe = await this.shouldSubscribeTopic(topic)

    // If topic needs to be subscribed, subscribe the topic
    if (shouldSubscribe) {
      await this.subscribeTopic(topic)
    } else {
      // Check if topic needs to be synced
      const shouldSync = await this.shouldSyncTopic(topic)

      // Check if sender is in subscribers list
      const subscriberDb = new SubscriberDb(this.db)
      const existingSubscriber = await subscriberDb.getByTopicAndContactAddress(topic, sender)

      // If topic needs sync or sender is not in subscribers list, sync the topic
      if (shouldSync || !existingSubscriber) {
        await this.syncTopicSubscribers(topic)
      }
    }

    // For topic messages, mark as read if it's our own message
    if (sender === this.client.addr) {
      const messageDb = new MessageDb(this.db)
      const existingMessage = await messageDb.queryByPayloadId(message.payload.id)
      if (existingMessage) {
        existingMessage.status = MessageStatus.Sent | MessageStatus.Receipt | MessageStatus.Read
        existingMessage.received_at = Date.now()
        await messageDb.update(existingMessage)
        // Notify frontend of message status update
        this._updateMessage?.(MessageSchema.fromDbModel(existingMessage))
      }
    }
  }

  async receiveMedia(message: MessageSchema) {
    try {
      if (!this.db) return
      const messageDb = new MessageDb(this.db)
      const msgRecord = await messageDb.queryByPayloadId(message.payload.id)
      if (!msgRecord) {
        await messageDb.insert(message.toDbModel())
        this._addMessage?.(message)
        await this.handleSession(message)
      }
    } catch (e) {
      logger.error('Failed to handle media message:', e)
    }
  }

  async handleMessage(raw: Message) {
    // Check if client is initialized
    if (!this.client?.isReady) {
      try {
        await Connect.waitForConnect()
        this.client = Connect.getLastSignClient()
        if (!this.client?.isReady) {
          logger.error('Client is not ready after waiting for connect')
          return
        }
      } catch (e) {
        logger.error('Failed to initialize client:', e)
        return
      }
    }

    if (raw.payloadType == PayloadType.TEXT) {
      let data: any
      try {
        data = JSON.parse(<string>raw.payload)
      } catch (e) {
        logger.error('Failed to parse message payload:', e)
        return
      }

      if (data == null || data.id == null || data.contentType == null) {
        logger.error('Invalid message payload:', data)
        return
      }

      const payload = new PayloadSchema(data)
      let sessionType = 0
      let messageStatus = MessageStatus.Error

      try {
        const message = MessageSchema.fromRawMessage(raw, raw.src, this.client?.addr || Connect.getLastSignInId(), {
          isOutbound: raw.src === this.client.addr
        })
        if (!message) {
          logger.error('Failed to create message schema from raw message')
          return
        }

        // Set received time for incoming messages
        if (!message.isOutbound) {
          message.receivedAt = Date.now()
        }

        if (payload.topic != null) {
          sessionType = SessionType.TOPIC
          await this.handleContact(message)
          await this.handleTopic(message)
        } else if (payload.groupId != null) {
          sessionType = SessionType.PRIVATE_GROUP
        } else {
          sessionType = SessionType.CONTACT
          await this.handleContact(message)
        }

        if (
          message.isOutbound &&
          this.client.addr === message.sender &&
          (message.payload.contentType === MessageContentType.text ||
            message.payload.contentType === MessageContentType.textExtension ||
            message.payload.contentType === MessageContentType.media ||
            message.payload.contentType === MessageContentType.image ||
            message.payload.contentType === MessageContentType.video ||
            message.payload.contentType === MessageContentType.audio ||
            message.payload.contentType === MessageContentType.file)
        ) {
          return
        }

        messageStatus = MessageStatus.Sent

        switch (payload.contentType) {
          case MessageContentType.receipt:
            await this.receiveReceiptMessage(data['targetID'])
            return
          case MessageContentType.read:
            await this.receiveReadMessage(data['readIds'])
            return
          // TODO
          case MessageContentType.piece:
            await this.receivePieceMessage(message)
            return
          case MessageContentType.text:
          case MessageContentType.media:
          case MessageContentType.image:
          case MessageContentType.video:
          case MessageContentType.audio:
          case MessageContentType.file:
            if (sessionType == SessionType.CONTACT) {
              await this.receipt(raw.src, payload.id)
              messageStatus = MessageStatus.Sent | MessageStatus.Receipt
            }
            break
          case MessageContentType.topicSubscribe:
            await this.receiveTopicSubscribeMessage(raw.src, payload.topic).catch((e) => {
              logger.error('Failed to receive topic subscribe message:', e)
            })
            break
          case MessageContentType.topicUnsubscribe:
            await this.receiveTopicUnsubscribeMessage(raw.src, payload.topic).catch((e) => {
              logger.error('Failed to receive topic unsubscribe message:', e)
            })
            break
          case MessageContentType.contactProfile:
            if ('requestType' in data) {
              await this.receiveContactRequestMessage(
                raw.src,
                data as IPayloadSchema & {
                  requestType: string
                  version: string
                }
              ).catch((e) => {
                logger.error('Failed to receive contact request message:', e)
              })
            } else if ('responseType' in data) {
              await this.receiveContactResponseMessage(
                raw.src,
                data as IPayloadSchema & {
                  responseType: string
                  version: string
                  content: {
                    avatar: {
                      type: string
                      data: string
                      ext: string
                    }
                    name: string
                  }
                }
              ).catch((e) => {
                logger.error('Failed to receive contact response message:', e)
              })
            }
            return
          default:
            logger.error('Unsupported message type:', payload.contentType)
            return
        }

        if (sessionType == 0) {
          logger.error('sessionType is not processed')
          return
        }

        const record = await this.saveMessage(message)
        if (record != null) {
          this._addMessage?.(record)
          await this.handleSession(record)
        }
      } catch (e) {
        logger.error('Failed to handle message:', e)
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
      lastMessageSender: message.sender,
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
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      const payload = MessageService.createReceiptPayload(msgId, { deviceId: this._deviceId })
      await this.send(to, payload)
    } catch (e) {
      logger.error('Failed to send receipt:', e)
    }
  }

  async read(to: string, readIds: string[]) {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      const payload = MessageService.createReadPayload(readIds, { deviceId: this._deviceId })
      await this.send(to, payload)
    } catch (e) {
      logger.error('Failed to send read status:', e)
    }
  }

  set addMessage(handler: AddMessageHandler) {
    this._addMessage = handler
  }

  get addMessage() {
    return this._addMessage
  }

  set updateMessage(handler: UpdateMessageHandler) {
    this._updateMessage = handler
  }

  get updateMessage() {
    return this._updateMessage
  }

  set updateSession(handler: UpdateSessionHandler) {
    this._updateSession = handler
  }

  get updateSession() {
    return this._updateSession
  }

  async saveMessage(message: MessageSchema, deduplication: boolean = false): Promise<MessageSchema | null> {
    if (!this.db) return message
    try {
      const messageDb = new MessageDb(this.db)
      const messRecord = await messageDb.queryByMessageId(bytesToHex(message.messageId))
      if (messRecord) {
        return null
      }
      if (deduplication) {
        const result = await messageDb.insertDeduplicationWithLock(message.toDbModel())
        if (!result) {
          return null
        }
      } else {
        await messageDb.insert(message.toDbModel())
      }
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
        sessRecord.last_message_sender = session.lastMessageSender
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

  async send(dest: string[] | string, payload: IPayloadSchema): Promise<void> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      await this.client.send(dest, JSON.stringify(payload), {
        ...sendOptions
      })
    } catch (e) {
      logger.error(e)
    }
  }

  private async sendMessage(
    type: SessionType,
    to: string,
    payload: PayloadSchema,
    messageId: Uint8Array
  ): Promise<MessageSchema> {
    const message = new MessageSchema({
      deviceId: this._deviceId ?? '',
      isOutbound: true,
      messageId: messageId,
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
      // First try to get subscribers from database
      dest = await this.getTopicSubscribersFromDb(to)

      // If database is not ready or no subscribers found, fetch from chain
      if (!this.db || dest.length === 0) {
        const subs = await this.client.getSubscribers(await genChannelId(to), {
          limit: 1000,
          offset: 0,
          meta: false,
          txPool: true
        })
        dest = [...(<string[]>subs.subscribers), ...(<string[]>subs.subscribersInTxPool)]

        // If database is ready, sync the subscribers
        if (this.db) {
          await this.syncTopicSubscribers(to)
        }
      }
      logger.debug('topic subscribers', dest)
      try {
        await this.client.send(dest, message.payload.toData(), {
          ...sendOptions,
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
          ...sendOptions,
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

  async sendText(type: SessionType, to: string, msg: string): Promise<MessageSchema> {
    if (!this.client?.isReady) {
      try {
        await Connect.waitForConnect()
      } catch (e) {
        logger.error(e)
        throw e
      }
    }
    const payload = new PayloadSchema(MessageService.createTextPayload(msg, { deviceId: this._deviceId }))
    if (type == SessionType.TOPIC) {
      payload.topic = to
    } else if (type == SessionType.PRIVATE_GROUP) {
      payload.groupId = to
    }

    return this.sendMessage(type, to, payload, MessageService.createMessageId())
  }

  async sendAudio(type: SessionType, to: string, data: string, options?: MediaOptions): Promise<MessageSchema> {
    if (!this.client?.isReady) {
      try {
        await Connect.waitForConnect()
      } catch (e) {
        logger.error(e)
        throw e
      }
    }
    const payload = new PayloadSchema(MessageService.createAudioPayload(data, { deviceId: this._deviceId }, options))
    if (type == SessionType.TOPIC) {
      payload.topic = to
    } else if (type == SessionType.PRIVATE_GROUP) {
      payload.groupId = to
    }

    return this.sendMessage(type, to, payload, MessageService.createMessageId())
  }

  async sendImage(type: SessionType, to: string, data: string, options?: MediaOptions): Promise<MessageSchema> {
    if (!this.client?.isReady) {
      try {
        await Connect.waitForConnect()
      } catch (e) {
        logger.error(e)
        throw e
      }
    }
    const payload = new PayloadSchema(MessageService.createImagePayload(data, { deviceId: this._deviceId }, options))
    if (type == SessionType.TOPIC) {
      payload.topic = to
    } else if (type == SessionType.PRIVATE_GROUP) {
      payload.groupId = to
    }

    return this.sendMessage(type, to, payload, MessageService.createMessageId())
  }

  async sendMedia(type: SessionType, to: string, data: string, options?: MediaOptions): Promise<MessageSchema> {
    if (!this.client?.isReady) {
      try {
        await Connect.waitForConnect()
      } catch (e) {
        logger.error(e)
        throw e
      }
    }
    const payload = new PayloadSchema(MessageService.createMediaPayload(data, { deviceId: this._deviceId }, options))
    if (type == SessionType.TOPIC) {
      payload.topic = to
    } else if (type == SessionType.PRIVATE_GROUP) {
      payload.groupId = to
    }

    return this.sendMessage(type, to, payload, MessageService.createMessageId())
  }

  async getSessionList(limit: number = 20, offset: number = 0): Promise<SessionSchema[]> {
    try {
      const sessionDb = new SessionDb(this.db)
      const list = await sessionDb.queryListRecent(limit, offset)
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
    options: {
      offset?: number
      limit?: number
    } = {
      offset: 0,
      limit: 50
    }
  ): Promise<MessageSchema[]> {
    try {
      const messageDb = new MessageDb(this.db)
      const list = await messageDb.getHistoryMessages(targetId, targetType, options)
      if (list) {
        return list.map((item) => MessageSchema.fromDbModel(item))
      }
    } catch (e) {
      logger.error(e)
    }
    return null
  }

  async getMessageByMessageId(messageId: string): Promise<MessageSchema> {
    const messageDb = new MessageDb(this.db)
    const message = await messageDb.queryByMessageId(messageId)
    return message ? MessageSchema.fromDbModel(message) : null
  }

  async getUnreadMessageCount(): Promise<number> {
    const messageDb = new MessageDb(this.db)
    const count = await messageDb.getUnreadMessageCount()
    return count || 0
  }

  async readAllMessagesByTargetId(targetId: string, targetType: SessionType): Promise<void> {
    try {
      const messageDb = new MessageDb(this.db)
      // Get all unread received messages
      const messages = await messageDb.getUnreadMessages(targetId, targetType)
      if (messages.length > 0) {
        // Group messages by sender
        const messagesBySender = new Map<string, string[]>()
        for (const message of messages) {
          const sender = message.sender
          if (!messagesBySender.has(sender)) {
            messagesBySender.set(sender, [])
          }
          messagesBySender.get(sender)?.push(message.payload_id)
        }

        // Send read protocol messages to each sender
        for (const [sender, payloadIds] of messagesBySender) {
          const payload = MessageService.createReadPayload(payloadIds, { deviceId: this._deviceId })
          await this.send(sender, payload)
        }

        // Update local message status
        await messageDb.updateReceivedMessagesStatusByTargetId(targetId, targetType, MessageStatus.Read)
      }

      const sessionDb = new SessionDb(this.db)
      const record = await sessionDb.query(targetId, targetType)
      if (record) {
        record.un_read_count = 0
        await sessionDb.update(record)
      }
    } catch (e) {
      logger.error(e)
    }
  }

  async deleteSession(targetId: string, targetType: SessionType): Promise<void> {
    if (!this.db) return
    try {
      const messageDb = new MessageDb(this.db)
      const sessionDb = new SessionDb(this.db)

      // Mark all messages as deleted
      await messageDb.markMessagesAsDeleted(targetId, targetType)

      // Delete the session
      await sessionDb.delete(targetId, targetType)

      // If current chat is the deleted session, clear current target
      if (this._currentChatTargetId === targetId) {
        this._currentChatTargetId = undefined
      }
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async readMessageById(msgId: string): Promise<void> {
    try {
      const messageDb = new MessageDb(this.db)
      const message = await messageDb.queryByPayloadId(msgId)
      if (!message) return

      // Update local message status
      await messageDb.updateStatusByPayloadId(msgId, MessageStatus.Read)

      // Send read protocol message to the sender
      if (!message.is_outbound) {
        const payload = MessageService.createReadPayload([msgId], { deviceId: this._deviceId })
        await this.send(message.sender, payload)
      }
    } catch (e) {
      logger.error(e)
    }
  }

  async getBlockHeight(): Promise<number> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      const block = await this.client.getLatestBlock()
      return block.height
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getNonce(): Promise<number> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      const nonce = await this.client.getNonce(this.client.addr, { txPool: true })
      return nonce
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getTopicSubscribers(topic: string): Promise<string[]> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      return await SubscribeService.getSubscribers({
        client: this.client,
        topic: topic
      })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getTopicSubscribersCount(topic: string): Promise<number> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      return await SubscribeService.getSubscribersCount({
        client: this.client,
        topic: topic
      })
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async subscribeTopic(
    topic: string,
    {
      nonce,
      fee,
      identifier,
      meta
    }: {
      nonce?: number
      fee?: number
      identifier?: string
      meta?: string
    } = {}
  ): Promise<void> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      let isNewSubscription = true
      try {
        // 1. Subscribe to the topic
        const result = await SubscribeService.subscribe({
          client: this.client,
          topic: topic,
          nonce,
          fee,
          identifier,
          meta
        })
      } catch (e) {
        if (e.message && e.message.includes('DuplicateSubscription')) {
          isNewSubscription = false
        } else {
          throw e
        }
      }

      // 2. Sync topic and subscribers
      await this.syncTopicSubscribers(topic)

      // 3. Send topicSubscribe message if it's a new subscription
      if (isNewSubscription) {
        const payload = MessageService.createTopicSubscribePayload(topic)
        payload.deviceId = this._deviceId
        const dest = await this.getTopicSubscribersFromDb(topic)
        logger.debug(`send topicSubscribe message to ${dest.length} subscribers:`)
        await this.send(dest, payload)
      }
    } catch (e) {
      logger.error('Failed to subscribe topic:', e)
      throw e
    }
  }

  async unsubscribeTopic(
    topic: string,
    {
      nonce,
      fee,
      identifier,
      meta
    }: {
      nonce?: number
      fee?: number
      identifier?: string
      meta?: string
    } = {}
  ): Promise<void> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      // 1. Unsubscribe from the topic
      try {
        await SubscribeService.unsubscribe({
          client: this.client,
          topic: topic,
          nonce,
          fee,
          identifier
        })
      } catch (e) {
        // If error is DoesNotExist, we still need to update the database
        if (e.message?.includes(NknError.DoesNotExist)) {
          // Update topic status
          const topicDb = new TopicDb(this.db)
          const existingTopic = await topicDb.getByTopic(topic)
          if (existingTopic) {
            existingTopic.joined = 0
            await topicDb.put(existingTopic)
          }
          return
        }
        throw e
      }

      // 2. Update topic and subscribers in database
      const topicDb = new TopicDb(this.db)
      const subscriberDb = new SubscriberDb(this.db)

      // Update topic status
      const existingTopic = await topicDb.getByTopic(topic)
      if (existingTopic) {
        existingTopic.joined = 0
        existingTopic.count = existingTopic.count - 1
        await topicDb.put(existingTopic)
      }

      // Remove current user's subscriber record
      await subscriberDb.deleteByTopicAndContactAddress(topic, this.client.addr)

      // 3. Send topicUnsubscribe message to other subscribers
      const payload = MessageService.createTopicUnsubscribePayload(topic)
      payload.deviceId = this._deviceId
      const dest = await this.getTopicSubscribersFromDb(topic)
      logger.debug(`send topicUnsubscribe message to ${dest.length} subscribers:`)
      await this.send(dest, payload)

      // 4. Insert topicUnsubscribe message for current user
      const message = new MessageSchema({
        deviceId: this._deviceId,
        isOutbound: true,
        messageId: MessageService.createMessageId(),
        payload: new PayloadSchema(payload),
        receiver: topic,
        sender: this.client.addr,
        sentAt: payload.timestamp,
        status: MessageStatus.Sent,
        targetId: topic,
        targetType: SessionType.TOPIC
      })
      const record = await this.saveMessage(message)
      if (record != null) {
        this._addMessage?.(record)
        await this.handleSession(record)
      }
    } catch (e) {
      logger.error('Failed to unsubscribe topic:', e)
      throw e
    }
  }

  async syncTopicSubscribers(topic: string): Promise<void> {
    // Get all subscribers from NKN chain
    const subscribers = await this.getTopicSubscribers(topic)

    // Get current block height for subscription expiry
    const blockHeight = await this.getBlockHeight()
    const expireHeight = blockHeight + blockHeightTopicSubscribeDefault

    // Update topic in database
    const topicDb = new TopicDb(this.db)
    const existingTopic = await topicDb.getByTopic(topic)
    const topicSchema = new TopicSchema({
      id: existingTopic?.id,
      topic: topic,
      joined: subscribers.includes(this.client.addr), // Check if current user is in subscribers list
      subscribeAt: Date.now(),
      expireHeight: expireHeight,
      count: subscribers.length,
      options: existingTopic?.options ? JSON.parse(existingTopic.options) : {}
    })

    await topicDb.put(topicSchema.toDbModel())

    // Update subscribers in database
    const subscriberDb = new SubscriberDb(this.db)

    // Get existing subscribers from database
    const existingSubscribers = await subscriberDb.getByTopic(topic)

    // Create a map of existing subscribers for quick lookup
    const existingSubscriberMap = new Map(existingSubscribers.map((sub) => [sub.contact_address, sub]))

    // Process each subscriber
    for (const subscriberAddress of subscribers) {
      const subscriber = new SubscriberSchema({
        topic: topic,
        contactAddress: subscriberAddress,
        status: SubscriberStatus.Subscribed,
        createdAt: Date.now()
      })

      const existingSubscriber = existingSubscriberMap.get(subscriberAddress)
      if (existingSubscriber) {
        // Update existing subscriber
        subscriber.id = existingSubscriber.id
        subscriber.updatedAt = Date.now()
        await subscriberDb.update(subscriber.toDbModel())
      } else {
        // Insert new subscriber
        await subscriberDb.insert(subscriber.toDbModel())
      }
    }

    // Remove subscribers that are no longer active
    for (const existingSubscriber of existingSubscribers) {
      if (!subscribers.includes(existingSubscriber.contact_address)) {
        await subscriberDb.delete(existingSubscriber.id)
      }
    }
  }

  async isTopicSubscribed(topic: string, address: string): Promise<boolean> {
    try {
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }
      const channelId = await genChannelId(topic)
      const subscription = await this.client.getSubscription(channelId, address)
      return subscription.expiresAt > 0
    } catch (e) {
      logger.error('Failed to check topic subscription:', e)
      return false
    }
  }

  async getTopicSubscribersFromDb(topic: string): Promise<string[]> {
    try {
      const subscriberDb = new SubscriberDb(this.db)
      const subscribers = await subscriberDb.getByTopic(topic)
      return subscribers.map((sub) => sub.contact_address)
    } catch (e) {
      logger.error('Failed to get topic subscribers from database:', e)
      return []
    }
  }

  // Contact
  async getContactByAddress(address: string): Promise<ContactSchema | null> {
    if (!address || !this.db) {
      return null
    }

    try {
      const contactDb = new ContactDb(this.db)
      const contact = await contactDb.getContactByAddress(address)
      return contact ? ContactSchema.fromDbModel(contact) : null
    } catch (e) {
      logger.error('Failed to get contact by address:', e)
      return null
    }
  }

  async getContactList({
    type,
    offset = 0,
    limit = 50
  }: {
    type?: ContactType
    offset?: number
    limit?: number
  }): Promise<string[]> {
    try {
      const contactDb = new ContactDb(this.db)
      const contacts = await contactDb.getContactList({ type, offset, limit })
      return contacts.map((contact) => contact.address)
    } catch (e) {
      logger.error('Failed to get contact list:', e)
      return []
    }
  }

  async requestContactData(address: string, requestType: 'header' | 'full' = 'full'): Promise<void> {
    if (!address || !this.client?.isReady || !this.db) {
      return
    }

    try {
      await ContactService.requestContact({
        client: this.client,
        db: this.db,
        address: address,
        requestType: requestType
      })
    } catch (e) {
      logger.error('Failed to request contact data:', e)
    }
  }

  async getOrCreateContact(address: string, { type }: { type?: ContactType }): Promise<ContactSchema | null> {
    if (!this.client?.isReady) {
      try {
        await Connect.waitForConnect()
      } catch (e) {
        logger.error(e)
        throw e
      }
    }
    const localContact = await ContactService.getOrCreateContact({
      db: this.db,
      address: this.client.addr,
      type: ContactType.ME
    })
    if (address === this.client.addr) {
      return localContact
    }
    const version = localContact?.profileVersion ?? '0'
    return ContactService.getOrCreateContact({ client: this.client, db: this.db, address, type, version })
  }

  async updateContact(contact: Partial<IContactSchema>): Promise<void> {
    return ContactService.updateContact({ db: this.db, contact })
  }

  private async shouldSyncTopic(topic: string): Promise<boolean> {
    const topicDb = new TopicDb(this.db)
    const record = await topicDb.getByTopic(topic)
    if (!record) return true

    // Get online count for comparison
    const onlineCount = await this.getTopicSubscribersCount(topic)
    const shouldSyncByCount = record.count !== onlineCount

    return shouldSyncByCount
  }

  private async shouldSubscribeTopic(topic: string): Promise<boolean> {
    const topicDb = new TopicDb(this.db)
    const record = await topicDb.getByTopic(topic)
    if (!record) return false

    const blockHeight = await this.getBlockHeight()
    const shouldSubscribeByExpire =
      record.expire_height && blockHeight + blockHeightTopicWarnBlockExpire >= record.expire_height

    return shouldSubscribeByExpire && record.joined === 1
  }

  // Topic
  async getTopicInfo(topic: string): Promise<TopicSchema | null> {
    try {
      const topicDb = new TopicDb(this.db)
      const record = await topicDb.getByTopic(topic)

      // If client is not ready, return data from database
      if (!this.client?.isReady) {
        try {
          await Connect.waitForConnect()
        } catch (e) {
          logger.error(e)
          throw e
        }
      }

      // Helper function to get updated record
      const getUpdatedRecord = async () => {
        const updatedRecord = await topicDb.getByTopic(topic)
        return updatedRecord ? TopicSchema.fromDbModel(updatedRecord) : null
      }

      // Check if topic needs to be subscribed
      const shouldSubscribe = await this.shouldSubscribeTopic(topic)

      if (shouldSubscribe) {
        await this.subscribeTopic(topic)
        return await getUpdatedRecord()
      }

      // Check if topic data is missing or expired
      const shouldSync = await this.shouldSyncTopic(topic)

      if (shouldSync) {
        await this.syncTopicSubscribers(topic)
        return await getUpdatedRecord()
      }

      return record ? TopicSchema.fromDbModel(record) : null
    } catch (e) {
      logger.error('Failed to get topic info:', e)
      return null
    }
  }

  async getTopicInfoFromDb(topic: string): Promise<TopicSchema | null> {
    try {
      const topicDb = new TopicDb(this.db)
      const record = await topicDb.getByTopic(topic)
      if (record) {
        return TopicSchema.fromDbModel(record)
      }
      return null
    } catch (e) {
      logger.error('Failed to get topic info from database:', e)
      return null
    }
  }

  // Cache
  async setCache(name: string, value: any): Promise<string> {
    return await CacheService.setCache({ db: this.db, name, value })
  }

  async getCache(id: string): Promise<CacheSchema | undefined> {
    return await CacheService.getCache({ db: this.db, id })
  }

  async deleteCache(id: string): Promise<void> {
    return await CacheService.deleteCache({ db: this.db, id })
  }

  async receivePieceMessage(message: MessageSchema) {
    try {
      // Get piece information
      const index = message.payload.options?.piece_index
      const total = message.payload.options?.piece_total
      const parity = message.payload.options?.piece_parity
      const parentType = message.payload.options?.piece_parent_type
      const bytesLength = message.payload.options?.piece_bytes_length

      if (index === undefined || total === undefined || parity === undefined) {
        logger.error('Invalid piece message options:', message.payload.options)
        return
      }

      message.deletedAt = Date.now()
      message.isDelete = true
      // save message to database
      await this.saveMessage(message)
      // Query all pieces
      const messageDb = new MessageDb(this.db)
      const pieces = await messageDb.queryByPayloadIdAndPayloadType(message.payload.id, MessageContentType.piece)

      // If we have enough pieces, decode them
      if (pieces.length >= total) {
        const messageDb = new MessageDb(this.db)
        const record = await messageDb.queryByPayloadIdAndPayloadType(
          message.payload.id,
          MessageContentType[parentType]
        )
        if (record && record.length > 0) {
          return
        }

        // Sort pieces by index
        pieces.sort((a, b) => {
          const aOptions = JSON.parse(a.payload_options || '{}')
          const bOptions = JSON.parse(b.payload_options || '{}')
          return (aOptions.piece_index || 0) - (bOptions.piece_index || 0)
        })

        const reedSolomon = new ReedSolomonService(total, parity)

        // TODO: fix this
        const hasAllDataShards = reedSolomon.hasAllDataShards(
          pieces.map((piece) => {
            const options = JSON.parse(piece.payload_options || '{}')
            return options.piece_index
          })
        )
        if (!hasAllDataShards) {
          logger.error('Not enough pieces to decode message')
          return
        }

        // Convert pieces to Uint8Array
        const pieceData = pieces.map((piece) => {
          // First decode base64, then handle UTF-8 encoding
          const base64Decoded = Buffer.from(piece.payload_content, 'base64')
          const decodedContent = new TextDecoder().decode(base64Decoded)
          return decodedContent
        })

        // Combine pieces
        const dataPieces = pieceData.slice(0, total)
        const combinedData = dataPieces.join('')

        // Create new message with combined data
        const combinedMessage = new MessageSchema({
          ...message,
          messageId: MessageService.createMessageId(),
          payload: new PayloadSchema({
            ...message.payload,
            contentType: MessageContentType[parentType],
            content: combinedData,
            options: {
              ...message.payload.options
            }
          }),
          status: MessageStatus.Sent
        })

        // Delete piece messages
        for (const piece of pieces) {
          await messageDb.update({
            ...piece,
            is_delete: 1,
            deleted_at: Date.now()
          })
        }

        await this.receiveImage(combinedMessage)
      }
    } catch (e) {
      logger.error('Failed to receive piece message:', e)
    }
  }
}
