import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/log'
import { MessageContentType } from './messageEnum'

export interface PayloadOptions {
  profileVersion?: string
}

export interface IPayloadSchema {
  id: string
  topic?: string
  groupId?: string
  content?: any
  contentType: MessageContentType
  timestamp?: number
  deviceId?: string
  options?: PayloadOptions
}

export class PayloadSchema implements IPayloadSchema {
  public id: string
  public topic?: string
  public groupId?: string
  public content: string
  public contentType: MessageContentType
  public timestamp: number
  public deviceId?: string
  public options: PayloadOptions

  constructor(schema: IPayloadSchema) {
    this.id = schema.id
    this.topic = schema.topic
    this.groupId = schema.groupId
    this.content = schema.content
    this.contentType = schema.contentType
    this.timestamp = schema.timestamp
    this.deviceId = schema.deviceId
    this.options = schema.options
  }

  static fromRawPayload(raw: string): PayloadSchema | null {
    let data: any
    try {
      data = JSON.parse(<string>raw)
    } catch (e) {
      logger.error(e)
      return null
    }

    if (data == null || data.id == null || data.contentType == null) {
      return null
    }

    const topic = data.topic
    const groupId = data.groupId

    const payload: IPayloadSchema = {
      id: data.id,
      content: data.content,
      contentType: data.contentType,
      timestamp: data.timestamp ?? Date.now(),
      options: data.options
    }
    if (topic) {
      payload.topic = topic
    }
    if (groupId) {
      payload.groupId = groupId
    }
    if (data.deviceId) {
      payload.deviceId = data.deviceId
    }

    return new PayloadSchema(payload)
  }

  toData(): string {
    const data: Record<string, any> = {}
    data.id = this.id ?? uuidv4()
    data.contentType = this.contentType
    data.timestamp = this.timestamp ?? Date.now()
    if (this.content != null) data.content = this.content
    if (this.options != null) data.options = this.options
    if (this.topic != null) data.topic = this.topic
    if (this.groupId != null) data.groupId = this.groupId
    if (this.deviceId != null) data.deviceId = this.deviceId

    return JSON.stringify(data)
  }
}
