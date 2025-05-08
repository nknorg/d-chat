import { SessionDbModel } from '../protocol/database/session'
import { PayloadOptions, PayloadSchema } from './payload'
import { SessionType } from './sessionEnum'

export interface ISessionSchema {
  id?: number
  targetId: string
  targetType: number
  lastMessageOutbound: boolean
  lastMessageSender?: string
  lastMessageAt?: number
  lastMessagePayload?: PayloadSchema
  lastMessageOptions?: PayloadOptions
  isTop: boolean
  unReadCount: number
}

export class SessionSchema implements ISessionSchema {
  public id?: number
  public targetId: string
  public targetType: SessionType
  public lastMessageOutbound: boolean
  public lastMessageSender?: string
  public lastMessageAt?: number
  public lastMessagePayload?: PayloadSchema
  public lastMessageOptions?: PayloadOptions
  public isTop: boolean = false
  public unReadCount: number = 0

  constructor(schema: ISessionSchema) {
    this.id = schema.id
    this.targetId = schema.targetId
    this.targetType = schema.targetType
    this.lastMessageOutbound = schema.lastMessageOutbound
    this.lastMessageSender = schema.lastMessageSender
    this.lastMessageAt = schema.lastMessageAt
    this.lastMessagePayload = schema.lastMessagePayload
    this.lastMessageOptions = schema.lastMessageOptions
    this.isTop = schema.isTop
    this.unReadCount = schema.unReadCount
  }

  toDbModel(): SessionDbModel {
    return {
      id: this.id,
      target_id: this.targetId,
      target_type: this.targetType,
      last_message_outbound: this.lastMessageOutbound ? 1 : 0,
      last_message_sender: this.lastMessageSender,
      last_message_at: this.lastMessageAt,
      last_message_payload: this.lastMessagePayload.toData(),
      last_message_options:
        this.lastMessageOptions != null ? JSON.stringify(this.lastMessageOptions) : null,
      is_top: this.isTop ? 1 : 0,
      un_read_count: this.unReadCount
    }
  }

  static fromDbModel(dbModel: SessionDbModel): SessionSchema {
    const payload = PayloadSchema.fromRawPayload(dbModel.last_message_payload)
    return new SessionSchema({
      id: dbModel.id,
      targetId: dbModel.target_id,
      targetType: dbModel.target_type,
      lastMessageOutbound: dbModel.last_message_outbound === 1,
      lastMessageSender: dbModel.last_message_sender,
      lastMessageAt: dbModel.last_message_at,
      lastMessagePayload: payload,
      lastMessageOptions:
        dbModel.last_message_options != null ? JSON.parse(dbModel.last_message_options) : null,
      isTop: dbModel.is_top === 1,
      unReadCount: dbModel.un_read_count
    })
  }
}
