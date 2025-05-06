import { v4 as uuidv4 } from 'uuid'
import nkn from 'nkn-sdk'
import { MessageContentType } from '../../schema/messageEnum'
import { IPayloadSchema, MediaOptions, PayloadOptions } from '../../schema/payload'

export interface MessageBody {
  id?: string
  type?: MessageContentType
  topic?: string
  groupId?: string
  deviceId?: string
  timestamp?: number
  options?: PayloadOptions
}

export const sendOptions = { noReply: true, msgHoldingSeconds: 8640000 }

export class MessageService {
  static createMessageId(): Uint8Array {
    return nkn.util.randomBytes(8)
  }

  private static fillPayloadFields(basePayload: Partial<IPayloadSchema>, body?: MessageBody, options?: Partial<PayloadOptions>): IPayloadSchema {
    return {
      id: body?.id ?? uuidv4(),
      timestamp: body?.timestamp ?? Date.now(),
      contentType: body?.type ?? MessageContentType.text,
      ...basePayload,
      ...(body?.deviceId ? { deviceId: body.deviceId } : {}),
      ...(body?.topic ? { topic: body.topic } : {}),
      ...(body?.groupId ? { groupId: body.groupId } : {}),
      ...(options ? { options } : {})
    }
  }

  static createTextPayload(content: string, body?: MessageBody): IPayloadSchema {
    return this.fillPayloadFields({ content }, body)
  }

  static createAudioPayload(data: string, body?: MessageBody, options?: MediaOptions): IPayloadSchema {
    return this.fillPayloadFields(
      {
        contentType: MessageContentType.audio,
        content: `![audio](${data})`
      },
      body,
      options as Partial<PayloadOptions>
    )
  }

  static createReceiptPayload(msgId: string, body?: MessageBody): IPayloadSchema & { targetID: string } {
    return {
      ...this.fillPayloadFields({
        contentType: MessageContentType.receipt
      }),
      targetID: msgId,
      ...body
    }
  }

  static createReadPayload(readIds: string[], body?: MessageBody): IPayloadSchema & { readIds: string[] } {
    return {
      ...this.fillPayloadFields({
        contentType: MessageContentType.read
      }),
      readIds,
      ...body
    }
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
