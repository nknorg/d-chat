import { CacheSchema } from '../schema/cache'
import { ContactSchema, IContactSchema } from '../schema/contact'
import { ContactType } from '../schema/contactEnum'
import { MessageSchema } from '../schema/message'
import { IPayloadSchema } from '../schema/payload'
import { SessionSchema } from '../schema/session'
import { SessionType } from '../schema/sessionEnum'
import { TopicSchema } from '../schema/topic'

export type AddMessageHandler = (message: MessageSchema) => void
export type UpdateSessionHandler = (session: SessionSchema) => void

export interface ChatProtocol {
  set addMessage(handler: AddMessageHandler)

  get addMessage(): AddMessageHandler | undefined

  set updateSession(handler: UpdateSessionHandler)

  get updateSession(): UpdateSessionHandler | undefined

  setDeviceId(deviceId: string): void

  getDeviceId(): string

  send(dest: string[] | string, payload: IPayloadSchema): Promise<void>

  sendText(type: SessionType, to: string, msg: string): Promise<MessageSchema>

  getSessionList(limit?: number, skip?: number): Promise<SessionSchema[]>

  getSessionByTargetId(targetId: string, targetType?: SessionType): Promise<SessionSchema | null>

  getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    options: {
      offset?: number
      limit?: number
    }
  ): Promise<MessageSchema[]>

  readAllMessagesByTargetId(targetId: string, targetType: SessionType): Promise<void>

  // subscribe
  getBlockHeight(): Promise<number>

  getNonce(): Promise<number>

  subscribeTopic(topic: string, { nonce, fee, identifier, meta }: { nonce?: number; fee?: number; identifier?: string; meta?: string }): Promise<void>

  unsubscribeTopic(topic: string, { nonce, fee, identifier, meta }: { nonce?: number; fee?: number; identifier?: string; meta?: string }): Promise<void>

  getTopicSubscribers(topic: string): Promise<string[]>

  getTopicSubscribersCount(topic: string): Promise<number>

  // Contact
  getContactList(): Promise<string[]>

  getContactByAddress(address: string): Promise<ContactSchema | null>

  requestContactData(address: string): Promise<void>

  getOrCreateContact(address: string, { type }: { type?: ContactType }): Promise<ContactSchema | null>

  updateContact(contact: Partial<IContactSchema>): Promise<void>

  // Topic
  getTopicInfo(topic: string): Promise<TopicSchema | null>

  // Cache
  setCache(key: string, value: string): Promise<string>

  getCache(key: string): Promise<CacheSchema | undefined>

  deleteCache(key: string): Promise<void>
}
