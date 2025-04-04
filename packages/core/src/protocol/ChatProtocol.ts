import { MessageSchema } from '../schema/message'

export type AddMessageHandler = (message: MessageSchema) => void

export interface ChatProtocol {
  set addMessage(handler: AddMessageHandler)

  get addMessage(): AddMessageHandler | undefined
}
