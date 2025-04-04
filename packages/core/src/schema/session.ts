import { SessionType } from './sessionEnum'

export interface ISessionSchema {
  id?: number
  targetId: string
  type: number
  lastMessageAt?: number
  lastMessageRaw?: object
  isTop: boolean
  unReadCount: number
  data: object
}

export class SessionSchema implements ISessionSchema {
  public id?: number
  public targetId: string
  public type: number
  public lastMessageAt?: number
  public lastMessageRaw?: object
  public isTop: boolean
  public unReadCount: number
  public data: object

  constructor(schema: ISessionSchema) {
    this.id = schema.id
    this.targetId = schema.targetId
    this.type = schema.type
    this.lastMessageAt = schema.lastMessageAt
    this.lastMessageRaw = schema.lastMessageRaw
    this.isTop = schema.isTop
    this.unReadCount = schema.unReadCount
    this.data = schema.data
  }

  get isContact(): boolean {
    return this.type == SessionType.CONTACT
  }

  get isTopic(): boolean {
    return this.type == SessionType.TOPIC
  }

  get isPrivateGroup(): boolean {
    return this.type == SessionType.PRIVATE_GROUP
  }

  // toDbModel(): SessionDbModel {
  //   return {
  //     id: this.id,
  //     target_id: this.targetId,
  //     type: this.type,
  //     last_message_at: this.lastMessageAt,
  //     last_message_raw: JSON.stringify(this.lastMessageRaw),
  //     is_top: this.isTop,
  //     un_read_count: this.unReadCount,
  //     data: JSON.stringify(this.data)
  //   }
  // }

  // static fromDbModel(model: SessionDbModel) {
  //   return new SessionSchema({
  //     data: model.data ? JSON.parse(model.data) : null,
  //     id: model.id,
  //     isTop: model.is_top ?? false,
  //     lastMessageAt: model.last_message_at,
  //     lastMessageRaw: model.last_message_raw,
  //     targetId: model.target_id,
  //     type: model.type,
  //     unReadCount: model.un_read_count
  //   })
  // }
}
