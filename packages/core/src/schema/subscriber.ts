import { SubscriberDbModel } from '../protocol/database/subscriber'
import { SubscriberStatus } from './subscriberEnum'

export interface ISubscriberSchema {
  id?: number
  createdAt?: number
  updatedAt?: number
  topicId: string
  contactAddress: string
  status: SubscriberStatus
  data?: object
}

export class SubscriberSchema implements ISubscriberSchema {
  public id?: number
  public createdAt?: number
  public updatedAt?: number
  public topicId: string
  public contactAddress: string
  public status: SubscriberStatus
  public data?: object

  constructor(schema: ISubscriberSchema) {
    this.id = schema.id
    this.createdAt = schema.createdAt
    this.updatedAt = schema.updatedAt
    this.topicId = schema.topicId
    this.contactAddress = schema.contactAddress
    this.status = schema.status
    this.data = schema.data
  }

  toDbModel(): SubscriberDbModel {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      topic_id: this.topicId,
      contact_address: this.contactAddress,
      status: this.status,
      data: this.data != null ? JSON.stringify(this.data) : undefined
    }
  }

  static fromDbModel(model: SubscriberDbModel) {
    return new SubscriberSchema({
      id: model.id,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      topicId: model.topic_id,
      contactAddress: model.contact_address,
      status: model.status,
      data: model.data ? JSON.parse(model.data) : undefined
    })
  }
}
