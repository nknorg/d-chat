import { Message } from 'nkn-sdk'
import { MessageDbModel } from '../protocol/database/message'
import { bytesToHex, hexToBytes } from '../utils/hash'
import { logger } from '../utils/log'
import { MessageStatus, PayloadType } from './messageEnum'
import { PayloadSchema } from './payload'
import { SessionType } from './sessionEnum'

export interface IMessageSchema {
  messageId?: Uint8Array
  queueId?: number
  deviceId?: string
  sender: string
  receiver: string
  targetId: string
  targetType: SessionType
  status?: MessageStatus
  isOutbound: boolean
  sentAt?: number
  receivedAt?: number
  deletedAt?: number
  isDelete?: boolean
  payload: PayloadSchema
}

export class MessageSchema implements IMessageSchema {
  public messageId?: Uint8Array
  public queueId?: number
  public deviceId?: string
  public sender: string
  public receiver: string
  public targetId: string
  public targetType: SessionType
  public status?: number
  public isOutbound: boolean
  public sentAt?: number = Date.now()
  public receivedAt?: number = Date.now()
  public deletedAt?: number
  public isDelete: boolean = false
  public payload: PayloadSchema
  public options?: Record<string, any>

  constructor(schema: IMessageSchema) {
    this.messageId = schema.messageId
    this.queueId = schema.queueId
    this.deviceId = schema.deviceId
    this.sender = schema.sender
    this.receiver = schema.receiver
    this.targetId = schema.targetId
    this.targetType = schema.targetType
    this.status = schema.status
    this.isOutbound = schema.isOutbound
    this.sentAt = schema.sentAt
    this.receivedAt = schema.receivedAt
    this.deletedAt = schema.deletedAt
    this.isDelete = schema.isDelete ?? false
    this.payload = schema.payload
  }

  static fromRawMessage(
    raw: Message,
    from: string,
    to: string,
    {
      isOutbound = false
    }: {
      isOutbound?: boolean
    } = {}
  ): MessageSchema | null {
    if (raw.payloadType == PayloadType.TEXT) {
      let data: any
      try {
        data = JSON.parse(<string>raw.payload)
      } catch (e) {
        logger.error(e)
      }

      if (data == null || data.id == null || data.contentType == null) {
        return null
      }

      const sender = raw.src
      const topic = data.topic
      const groupId = data.groupId
      const targetId = topic != null ? topic : groupId != null ? groupId : sender
      const targetType =
        topic != null ? SessionType.TOPIC : groupId != null ? SessionType.PRIVATE_GROUP : SessionType.CONTACT

      const now = Date.now()
      const payload = PayloadSchema.fromRawPayload(<string>raw.payload)
      const schema = new MessageSchema({
        messageId: raw.messageId,
        deviceId: data.deviceId,
        sender: from,
        receiver: to,
        targetId: targetId,
        targetType: targetType,
        isOutbound: isOutbound,
        isDelete: false,
        status: MessageStatus.Sent,
        sentAt: Math.min(data.timestamp ?? now, now),
        payload: payload,
        receivedAt: now
      })

      return schema
    }

    return null
  }

  static fromDbModel(model: MessageDbModel): MessageSchema {
    return new MessageSchema({
      messageId: model.message_id != null ? hexToBytes(model.message_id) : undefined,
      queueId: model.queue_id,
      deviceId: model.device_id,
      sender: model.sender,
      receiver: model.receiver,
      targetId: model.target_id,
      targetType: model.target_type,
      status: model.status,
      isOutbound: model.is_outbound === 1,
      sentAt: model.sent_at,
      receivedAt: model.received_at,
      deletedAt: model.deleted_at,
      isDelete: model.is_delete === 1,
      payload: PayloadSchema.fromRawPayload(model.payload)
    })
  }

  toDbModel(): MessageDbModel {
    return {
      message_id: this.messageId != null ? bytesToHex(this.messageId) : undefined,
      queue_id: this.queueId,
      device_id: this.deviceId,
      sender: this.sender,
      receiver: this.receiver,
      target_id: this.targetId,
      target_type: this.targetType,
      payload: this.payload.toData(),
      payload_id: this.payload.id,
      payload_type: this.payload.contentType,
      payload_content: this.payload.content,
      payload_options: this.payload.options != null ? JSON.stringify(this.payload.options) : undefined,
      status: this.status,
      is_outbound: this.isOutbound ? 1 : 0,
      sent_at: this.sentAt,
      received_at: this.receivedAt,
      is_delete: this.isDelete ? 1 : 0,
      deleted_at: this.deletedAt
    }
  }
}
