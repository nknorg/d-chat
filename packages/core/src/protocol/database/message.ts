import Dexie from 'dexie'
import { SessionType } from '../../schema/sessionEnum'

export interface MessageDbModel {
  id?: number
  message_id?: string
  device_id?: string
  queue_id?: number
  msg_id: string
  sender: string
  receiver: string
  target_id: string
  target_type: number
  payload: string
  status?: number
  is_outbound?: boolean
  sent_at?: number
  received_at?: number
  is_delete?: boolean
  deleted_at?: number
  type?: string
  options: string
  content?: string
  created_at?: number
  updated_at?: number
}

export interface IMessageDb {
  insert(model: MessageDbModel): Promise<void>

  update(model: MessageDbModel): Promise<void>

  queryByMsgId(msgId: string): Promise<MessageDbModel | undefined>

  queryByTargetId(
    targetId: string,
    targetType: SessionType,
    options: {
      isOutbound?: boolean
      status?: number
      isDelete?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<MessageDbModel[]>
}

export class MessageDb implements IMessageDb {
  static tableName = 'messages'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  insert(model: MessageDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }

  queryByMsgId(msgId: string): Promise<MessageDbModel | undefined> {
    return Promise.resolve(undefined)
  }

  queryByTargetId(
    targetId: string,
    targetType: SessionType,
    options: {
      isOutbound?: boolean
      status?: number
      isDelete?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<MessageDbModel[]> {
    return Promise.resolve([])
  }

  update(model: MessageDbModel): Promise<void> {
    return Promise.resolve(undefined)
  }
}
