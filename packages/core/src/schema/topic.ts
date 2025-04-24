import { TopicDbModel } from '../protocol/database/topic'
import { randomColorList1, randomColorList2 } from './contactEnum'

export interface ITopicOptions {
  deleteAfterSeconds?: number
  updateBurnAfterAt?: number
  avatarBgColor?: string
  avatarFgColor?: string
}

export interface ITopicSchema {
  id?: number
  createdAt?: number
  updatedAt?: number
  topicId: string
  joined: boolean
  subscribeAt?: number
  expireHeight?: number
  avatar?: string
  count: number
  options?: ITopicOptions
  data?: object
}

export class TopicSchema implements ITopicSchema {
  public id?: number
  public createdAt?: number
  public updatedAt?: number
  public topicId: string
  public joined: boolean
  public subscribeAt?: number
  public expireHeight?: number
  public avatar?: string
  public count: number
  public options?: ITopicOptions
  public data?: object

  constructor(schema: ITopicSchema) {
    this.id = schema.id
    this.createdAt = schema.createdAt
    this.updatedAt = schema.updatedAt
    this.topicId = schema.topicId
    this.joined = schema.joined
    this.subscribeAt = schema.subscribeAt
    this.expireHeight = schema.expireHeight
    this.avatar = schema.avatar
    this.count = schema.count
    this.options = schema.options ?? {}
    this.data = schema.data

    const random = Math.floor(Math.random() * 6) + 1
    if (this.options.avatarBgColor == null) {
      this.options.avatarBgColor = randomColorList1[random]
    }
    if (this.options.avatarFgColor == null) {
      this.options.avatarFgColor = randomColorList2[random]
    }
  }

  toDbModel(): TopicDbModel {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      topic_id: this.topicId,
      joined: this.joined ? 1 : 0,
      subscribe_at: this.subscribeAt,
      expire_height: this.expireHeight,
      avatar: this.avatar,
      count: this.count,
      options: this.options != null ? JSON.stringify(this.options) : undefined,
      data: this.data != null ? JSON.stringify(this.data) : undefined
    }
  }

  static fromDbModel(model: TopicDbModel) {
    return new TopicSchema({
      id: model.id,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      topicId: model.topic_id,
      joined: model.joined === 1,
      subscribeAt: model.subscribe_at,
      expireHeight: model.expire_height,
      avatar: model.avatar,
      count: model.count,
      options: model.options ? JSON.parse(model.options) : undefined,
      data: model.data ? JSON.parse(model.data) : undefined
    })
  }
}
