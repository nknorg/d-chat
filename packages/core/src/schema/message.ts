import { Message } from 'nkn-sdk'
import { MessageDbModel } from '../protocol/database/message'
import { hexToBytes, bytesToHex } from '../utils/hash'
import { logger } from '../utils/log'
import { MessageContentType, MessageStatus } from './messageEnum'
import { SessionType } from './sessionEnum'

enum PayloadType {
  BINARY = 0,
  TEXT = 1,
  ACK = 2,
  SESSION = 3
}

export interface IMessageSchema {
  messageId?: Uint8Array
  msgId: string
  queueId?: number
  from: string
  to: string
  targetId: string
  targetType: SessionType
  status?: number
  isOutbound: boolean
  sentAt?: number
  receivedAt?: number
  deletedAt?: number
  isDelete: boolean
  contentType?: string
  content?: string
  deviceId?: string
  payload: string
  options?: Record<string, any>
}

export class MessageSchema implements IMessageSchema {
  public messageId?: Uint8Array
  public msgId: string
  public queueId?: number
  public from: string
  public to: string
  public targetId: string
  public targetType: SessionType
  public status?: number
  public isOutbound: boolean
  public sentAt?: number = Date.now()
  public receivedAt?: number = Date.now()
  public deletedAt?: number
  public isDelete: boolean = false
  public contentType?: string
  public content?: string
  public deviceId?: string
  public payload: string
  public options?: Record<string, any>

  private _needBurning
  private _needDisplay
  private _needResend
  private _needReceipt
  private _needNotification

  constructor(schema: IMessageSchema) {
    this.messageId = schema.messageId
    this.msgId = schema.msgId
    this.queueId = schema.queueId
    this.from = schema.from
    this.to = schema.to
    this.targetId = schema.targetId
    this.targetType = schema.targetType
    this.status = schema.status
    this.isOutbound = schema.isOutbound
    this.sentAt = schema.sentAt
    this.receivedAt = schema.receivedAt
    this.deletedAt = schema.deletedAt
    this.isDelete = schema.isDelete
    this.isDelete = schema.isDelete
    this.contentType = schema.contentType
    this.content = schema.content
    this.deviceId = schema.deviceId
    this.payload = schema.payload
    this.options = schema.options
  }

  private getStatus() {
    this._needBurning = false
    this._needResend = false
    this._needReceipt = false
    this._needNotification = false
    this._needDisplay = false
    switch (this.contentType) {
      case MessageContentType.text:
      case MessageContentType.textExtension:
      case MessageContentType.ipfs:
      case MessageContentType.image:
      case 'media': // todo:Compatible image
      case MessageContentType.audio:
        this._needBurning = true
        this._needResend = true
        this._needReceipt = true
        this._needNotification = true
        this._needDisplay = true
        break
      case MessageContentType.topicInvitation:
      case MessageContentType.privateGroupInvitation:
        this._needReceipt = true
        this._needNotification = true
        this._needDisplay = true
        break
      case MessageContentType.contactOptions:
      case MessageContentType.topicSubscribe:
      case MessageContentType.privateGroupSubscribe:
        this._needNotification = true
        this._needDisplay = true
        break
    }
  }

  get needBurning(): boolean {
    this.getStatus()
    return this._needBurning
  }

  get needResend(): boolean {
    this.getStatus()
    return this._needResend
  }

  get needReceipt(): boolean {
    this.getStatus()
    return this._needReceipt
  }

  get needNotification(): boolean {
    this.getStatus()
    return this._needNotification
  }

  get needDisplay(): boolean {
    this.getStatus()
    return this._needDisplay
  }

  static fromRawMessage(
    raw: Message,
    from: string,
    to: string,
    isOutbound: boolean
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
        topic != null
          ? SessionType.TOPIC
          : groupId != null
            ? SessionType.PRIVATE_GROUP
            : SessionType.CONTACT

      const schema = new MessageSchema({
        messageId: raw.messageId,
        from: from,
        to: to,
        msgId: data.id,
        payload: <string>raw.payload,
        queueId: data.queueId,
        targetId: targetId,
        targetType: targetType,
        status: MessageStatus.Success,
        isOutbound: isOutbound,
        sentAt: data.timestamp ?? Date.now(),
        contentType: data.contentType,
        options: data.options,
        isDelete: false
      })
      switch (schema.contentType) {
        case MessageContentType.receipt:
          schema.content = data['targetID']
          break
        case MessageContentType.read:
          schema.content = data['readIds']
          break
        case MessageContentType.contactProfile:
        case MessageContentType.contactOptions:
        case MessageContentType.deviceRequest:
        case MessageContentType.deviceInfo:
          schema.content = data
          break
        default:
          schema.content = data['content']
          break
      }
      schema.deviceId = data.deviceId
      return schema
    }

    return null
  }

  static fromJson(m: IMessageSchema) {
    const schema = new MessageSchema({
      contentType: m.contentType,
      deletedAt: m.deletedAt,
      deviceId: m.deviceId,
      from: m.from,
      queueId: m.queueId,
      targetId: m.targetId,
      targetType: m.targetType,
      isDelete: m.isDelete,
      isOutbound: m.isOutbound,
      messageId: m.messageId,
      msgId: m.msgId,
      options: m.options,
      payload: m.payload,
      receivedAt: m.receivedAt,
      sentAt: m.sentAt,
      status: m.status,
      to: m.to
    })
    switch (schema.contentType) {
      case MessageContentType.contactProfile:
      case MessageContentType.contactOptions:
      case MessageContentType.deviceRequest:
      case MessageContentType.deviceInfo:
        if (typeof m.content == 'string') {
          schema.content = JSON.parse(m.content)
        } else {
          schema.content = m.content
        }
        break
      case MessageContentType.ipfs: // maybe null
      case MessageContentType.image:
      case 'media': // todo:Compatible image
      case MessageContentType.audio:
      case MessageContentType.piece:
      case 'nknOnePiece': // todo:Compatible piece
        // todo
        // String ? completePath = Path.convert2Complete(e['content'])
        // schema.content = (completePath?.isNotEmpty == true) ? File(completePath!) : null
        break
      case MessageContentType.privateGroupInvitation:
      case MessageContentType.privateGroupAccept:
      case MessageContentType.privateGroupQuit:
      case MessageContentType.privateGroupOptionRequest:
      case MessageContentType.privateGroupOptionResponse:
      case MessageContentType.privateGroupMemberRequest:
      case MessageContentType.privateGroupMemberResponse:
        if (typeof m.content == 'string') {
          schema.content = JSON.parse(m.content)
        } else {
          schema.content = m.content
        }
        break
      default:
        schema.content = m.content
        break
    }
    return schema
  }

  static fromDbModel(model: MessageDbModel): MessageSchema {
    return new MessageSchema({
      content: model.content,
      contentType: model.type,
      deletedAt: model.deleted_at,
      deviceId: model.device_id,
      from: model.sender,
      to: model.receiver,
      queueId: model.queue_id,
      targetId: model.target_id,
      targetType: model.target_type,
      isDelete: model.is_delete == true,
      isOutbound: model.is_outbound == true,
      messageId: model.message_id != null ? hexToBytes(model.message_id) : undefined,
      msgId: model.msg_id,
      options: model.options != null ? JSON.parse(model.options) : undefined,
      payload: model.payload,
      receivedAt: model.received_at,
      sentAt: model.sent_at,
      status: model.status
    })
  }

  toDbModel(): MessageDbModel {
    return {
      message_id: this.messageId != null ? bytesToHex(this.messageId) : undefined,
      msg_id: this.msgId,
      sender: this.from,
      receiver: this.to,
      target_id: this.targetId,
      target_type: this.targetType,
      status: this.status,
      is_outbound: this.isOutbound,
      sent_at: this.sentAt,
      received_at: this.receivedAt,

      is_delete: this.isDelete,
      deleted_at: this.deletedAt,
      type: this.contentType,
      options: JSON.stringify(this.options),
      payload: this.payload,
      content: this.content
    }
  }
}
