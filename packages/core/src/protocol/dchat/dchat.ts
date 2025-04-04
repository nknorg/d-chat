import { Message, MultiClient } from 'nkn-sdk'
import { Connect } from '../../chat/connect'
import { MessageSchema } from '../../schema/message'
import { MessageContentType } from '../../schema/messageEnum'
import { StoreAdapter } from '../../store/storeAdapter'
import { logger } from '../../utils/log'
import { AddMessageHandler, ChatProtocol } from '../ChatProtocol'
import { MessageDb } from '../database/message'

export class Dchat implements ChatProtocol {
  private client: MultiClient
  private db: any
  private deviceId: string

  private blockHeightTopicSubscribeDefault = 400000 // 93days
  private sendOptions = { noReply: true, msgHoldingSeconds: 8640000 }
  private _currentChatTargetId?: string

  private _addMessage?: AddMessageHandler

  constructor() {
    this.client = Connect.getLastSignClient()
    this.db = StoreAdapter.db?.getLastOpenedDb()
  }

  async receiveText(message: MessageSchema) {
    const messageDb = new MessageDb(this.db)
    const msgRecord = await messageDb.queryByMsgId(message.msgId)
    if (!msgRecord) {
      const ok = await messageDb.insert(message.toDbModel())
    }
  }

  async receiveImage(message: MessageSchema) {
    const messageDb = new MessageDb(this.db)
    const msgRecord = await messageDb.queryByMsgId(message.msgId)
    if (!msgRecord) {
      const ok = await messageDb.insert(message.toDbModel())
    }
  }

  async handleContactMessage(message: MessageSchema) {}

  async handleMessage(raw: Message) {
    const message = MessageSchema.fromRawMessage(raw, raw.src, this.client.addr, false)
    if (message == null) {
      logger.error(`handleMessage: message is null`)
      return
    }

    switch (message.contentType) {
      case MessageContentType.text:
      case MessageContentType.textExtension:
        await this.receiveText(message)
        break
      case 'media': // TODO: compatible
        message.contentType = 'image'
      case MessageContentType.image:
        await this.receiveImage(message)
        break
    }

    // TODO: d-chat protocol
    await this.handleContactMessage(message)

    // update view
    if (message.needDisplay) {
      this._addMessage?.(message)
    }

    await this.handleSession(message)
  }

  async handleSession(message: MessageSchema) {
    // if (!message.needDisplay) return
    // if (!message.targetId) return
    // let type = message.targetType
    //
    // const targetId = message.targetId
    // // unread count
    // let inSessionPage = this.currentChatTargetId == targetId
    // let unreadCount = message.isOutbound ? 0 : (message.needNotification ? 1 : 0)
    // unreadCount = inSessionPage ? 0 : unreadCount
    // const sessionDb = new Session(this.db)
    // const sess = await sessionDb.query(targetId, type)
    // let addedSess
    // if (!sess) {
    //   addedSess = {
    //     target_id: targetId,
    //     type: type,
    //     last_message_raw: JSON.stringify(message.toDbModel()),
    //     last_message_at: message.sendAt,
    //     un_read_count: unreadCount
    //   }
    //   await sessionDb.insert(addedSess)
    // } else {
    //   addedSess = {
    //     target_id: targetId,
    //     type: type,
    //     last_message_raw: JSON.stringify(message.toDbModel()),
    //     last_message_at: message.sendAt,
    //     un_read_count: unreadCount + sess.un_read_count
    //   }
    //   await sessionDb.updateLastMessage(addedSess)
    // }
    // show UI
    // if (message.needDisplay) {
    //   mainWindow.webContents.send('updateSession', SessionSchema.fromDbModel(addedSess))
    // }
  }

  set currentChatTargetId(targetId: string) {
    this._currentChatTargetId = targetId
  }

  get currentChatTargetId() {
    return this._currentChatTargetId
  }

  set addMessage(handler: AddMessageHandler) {
    this._addMessage = handler
  }

  get addMessage() {
    return this._addMessage
  }
}
