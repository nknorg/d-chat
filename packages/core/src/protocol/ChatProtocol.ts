import { MessageSchema } from '../schema/message'
import { SessionSchema } from '../schema/session'
import { SessionType } from '../schema/sessionEnum'

export type AddMessageHandler = (message: MessageSchema) => void
export type UpdateSessionHandler = (session: SessionSchema) => void

export interface ChatProtocol {
  set addMessage(handler: AddMessageHandler)

  get addMessage(): AddMessageHandler | undefined

  set updateSession(handler: UpdateSessionHandler)

  get updateSession(): UpdateSessionHandler | undefined

  setDeviceId(deviceId: string): void

  getDeviceId(): string

  sendText(type: SessionType, to: string, msg: string): Promise<MessageSchema>

  getSessionList(limit?: number, skip?: number): Promise<SessionSchema[]>

  getSessionByTargetId(targetId: string, targetType?: SessionType): Promise<SessionSchema | null>

  getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    limit?: number,
    skip?: number
  ): Promise<MessageSchema[]>

  readAllMessagesByTargetId(targetId: string, targetType: SessionType): Promise<void>

  // subscribe
  getBlockHeight(): Promise<number>

  getNonce(): Promise<number>

  subscribeTopic(
    topicId: string,
    {
      nonce,
      fee,
      identifier,
      meta
    }: { nonce?: number; fee?: number; identifier?: string; meta?: string }
  ): Promise<void>

  unsubscribeTopic(
    topicId: string,
    {
      nonce,
      fee,
      identifier,
      meta
    }: { nonce?: number; fee?: number; identifier?: string; meta?: string }
  ): Promise<void>

  getTopicSubscribers(topic: string): Promise<string[]>
}
