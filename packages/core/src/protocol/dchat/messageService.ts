import { randomUUID } from 'crypto'
import { MessageContentType } from '../../schema/messageEnum'
import { SessionType } from '../../schema/sessionEnum'

export interface IMessageService {
  getMessageList(
    targetId: string,
    targetType: SessionType,
    options: { limit?: number; offset?: number }
  ): Promise<any>

  createTextPayload(
    content: string,
    options?: { id?: string; deviceId?: string; type?: string; timestamp?: number }
  ): object

  createImagePayload(
    content: string,
    options?: { id?: string; type?: string; timestamp?: number }
  ): object
}

export class MessageService implements IMessageService {
  async getMessageList(targetId: string, targetType: SessionType, { limit = 20, offset = 0 }) {
    // const res = await this.messageDb.queryByTargetId(targetId, targetType, {
    //   limit: limit,
    //   offset: offset
    // })
    // return res.map((e) => MessageSchema.fromDbModel(e))
  }

  createTextPayload(
    content: string,
    options?: { id?: string; deviceId?: string; type?: string; timestamp?: number }
  ): object {
    const data = {
      id: options?.id ?? randomUUID().toString(),
      timestamp: options?.timestamp ?? Date.now(),
      deviceId: options?.deviceId,
      contentType: options?.type ?? MessageContentType.text,
      content: content
    }
    return data
  }

  createImagePayload(
    content: string,
    options?: { id?: string; type?: string; timestamp?: number }
  ): object {
    // const data = {
    //   'id': options?.id ?? randomUUID().toString(),
    //   'timestamp': options?.timestamp ?? Date.now(),
    //   'deviceId': Global.deviceId,
    //   'contentType': options?.type ?? MessageContentType.image,
    //   'content': content
    // }
    // return data
  }
}
