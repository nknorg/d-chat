import { v4 as uuidv4 } from 'uuid'
import nkn from 'nkn-sdk'
import { MessageContentType } from '../../schema/messageEnum'
import { IPayloadSchema, PayloadSchema } from '../../schema/payload'

export interface MessageOptions {
  id?: string
  type?: MessageContentType
  topic?: string
  groupId?: string
  deviceId?: string
  timestamp?: number
}

export const sendOptions = { noReply: true, msgHoldingSeconds: 8640000 }

export class MessageService {
  static createMessageId(): Uint8Array {
    return nkn.util.randomBytes(8)
  }

  private static fillPayloadFields(basePayload: Partial<IPayloadSchema>, options?: MessageOptions): IPayloadSchema {
    return {
      id: options?.id ?? uuidv4(),
      timestamp: options?.timestamp ?? Date.now(),
      deviceId: options?.deviceId,
      contentType: options?.type ?? MessageContentType.text,
      ...basePayload,
      ...(options?.topic ? { topic: options.topic } : {}),
      ...(options?.groupId ? { groupId: options.groupId } : {})
    }
  }

  static createTextPayload(content: string, options?: MessageOptions): IPayloadSchema {
    return this.fillPayloadFields({ content }, options)
  }

  static createTopicSubscribePayload(topic: string): IPayloadSchema {
    return this.fillPayloadFields({
      contentType: MessageContentType.topicSubscribe,
      topic
    })
  }

  static createTopicUnsubscribePayload(topic: string): IPayloadSchema {
    return this.fillPayloadFields({
      contentType: MessageContentType.topicUnsubscribe,
      topic
    })
  }

  static createContactRequestPayload({ requestType = 'header', version }: { requestType: 'header' | 'full'; version: string }): IPayloadSchema & {
    requestType: string
    version: string
  } {
    return {
      ...this.fillPayloadFields({
        contentType: MessageContentType.contactProfile
      }),
      requestType: requestType,
      version: version
    }
  }

  static createContactResponsePayload({
    avatar,
    name,
    responseType = 'header',
    version
  }: {
    avatar: {
      type: 'base64'
      data: string
      ext: string
    }
    name: string
    responseType: 'header' | 'full'
    version: string
  }): IPayloadSchema & {
    responseType: string
    version: string
  } {
    return {
      ...this.fillPayloadFields({
        contentType: MessageContentType.contactProfile
      }),
      responseType: responseType,
      content: { avatar, name },
      version: version
    }
  }
}
