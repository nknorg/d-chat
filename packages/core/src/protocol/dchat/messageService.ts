import { v4 as uuidv4 } from 'uuid'
import nkn from 'nkn-sdk'
import { MessageContentType } from '../../schema/messageEnum'
import { IPayloadSchema, PayloadSchema } from '../../schema/payload'

export class MessageService {
  static createMessageId(): Uint8Array {
    return nkn.util.randomBytes(8)
  }

  static createTextPayload(
    content: string,
    options?: {
      id?: string
      type?: MessageContentType
      topic?: string
      groupId?: string
      deviceId?: string
      timestamp?: number
    }
  ): IPayloadSchema {
    const data: IPayloadSchema = {
      id: options?.id ?? uuidv4(),
      timestamp: options?.timestamp ?? Date.now(),
      deviceId: options?.deviceId,
      contentType: options?.type ?? MessageContentType.text,
      content: content
    }
    if (options?.topic) {
      data.topic = options.topic
    }
    if (options?.groupId) {
      data.groupId = options.groupId
    }
    return data
  }

  static createTopicSubscribePayload(topic: string): IPayloadSchema {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      contentType: MessageContentType.topicSubscribe,
      topic: topic
    }
  }

  static createTopicUnsubscribePayload(topic: string): IPayloadSchema {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      contentType: MessageContentType.topicUnsubscribe,
      topic: topic
    }
  }
}
