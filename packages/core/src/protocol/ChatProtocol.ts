import { CacheSchema } from '../schema/cache'
import { ContactSchema, IContactSchema } from '../schema/contact'
import { ContactType } from '../schema/contactEnum'
import { MessageSchema } from '../schema/message'
import { IPayloadSchema, MediaOptions } from '../schema/payload'
import { SessionSchema } from '../schema/session'
import { SessionType } from '../schema/sessionEnum'
import { TopicSchema } from '../schema/topic'

export type AddMessageHandler = (message: MessageSchema) => void
export type UpdateMessageHandler = (message: MessageSchema) => void
export type UpdateSessionHandler = (session: SessionSchema) => void

export interface ChatProtocol {
  /** Handler for adding new messages */
  set addMessage(handler: AddMessageHandler)
  get addMessage(): AddMessageHandler | undefined

  /** Handler for updating message information */
  set updateMessage(handler: UpdateMessageHandler)
  get updateMessage(): UpdateMessageHandler | undefined

  /** Handler for updating session information */
  set updateSession(handler: UpdateSessionHandler)
  get updateSession(): UpdateSessionHandler | undefined

  /**
   * Sets the device ID for the current chat instance
   * @param deviceId - The unique identifier for the device
   */
  setDeviceId(deviceId: string): void

  /**
   * Gets the current device ID
   * @returns The device ID string
   */
  getDeviceId(): string

  /**
   * Sends a payload to one or multiple destinations
   * @param dest - Single destination or array of destinations
   * @param payload - The payload to send
   */
  send(dest: string[] | string, payload: IPayloadSchema): Promise<void>

  /**
   * Sends a text message to a specific destination
   * @param type - The type of session
   * @param to - The destination address
   * @param msg - The message content
   * @returns Promise resolving to the sent message schema
   */
  sendText(type: SessionType, to: string, msg: string): Promise<MessageSchema>

  /**
   * Sends an audio message to a specific destination
   * @param type - The type of session
   * @param to - The destination address
   * @param data - The audio data in base64 format
   * @param options - Optional payload options
   * @returns Promise resolving to the sent message schema
   */
  sendAudio(type: SessionType, to: string, data: string, options?: MediaOptions): Promise<MessageSchema>

  /**
   * Sends a receipt message to a specific destination
   * @param to - The destination address
   * @param msgId - The message ID
   */
  receipt(to: string, msgId: string): Promise<void>

  /**
   * Sends a read message to a specific destination
   * @param to - The destination address
   * @param readIds - The message IDs
   */
  read(to: string, readIds: string[]): Promise<void>

  /**
   * Retrieves a list of sessions
   * @param limit - Optional maximum number of sessions to return
   * @param offset - Optional offset for pagination
   * @returns Promise resolving to array of session schemas
   */
  getSessionList(limit?: number, offset?: number): Promise<SessionSchema[]>

  /**
   * Gets a specific session by target ID
   * @param targetId - The target identifier
   * @param targetType - Optional session type
   * @returns Promise resolving to session schema or null if not found
   */
  getSessionByTargetId(targetId: string, targetType?: SessionType): Promise<SessionSchema | null>

  /**
   * Retrieves historical messages for a specific target
   * @param targetId - The target identifier
   * @param targetType - The type of session
   * @param options - Pagination options
   * @returns Promise resolving to array of message schemas
   */
  getHistoryMessages(
    targetId: string,
    targetType: SessionType,
    options: {
      offset?: number
      limit?: number
    }
  ): Promise<MessageSchema[]>

  /**
   * Retrieves a message by its ID
   * @param messageId - The ID of the message to retrieve
   * @returns Promise resolving to the message schema or null if not found
   */
  getMessageByMessageId(messageId: string): Promise<MessageSchema>

  /**
   * Marks all messages as read for a specific target
   * @param targetId - The target identifier
   * @param targetType - The type of session
   */
  readAllMessagesByTargetId(targetId: string, targetType: SessionType): Promise<void>

  /**
   * Reads a message by its ID
   * @param messageId - The ID of the message to read
   */
  readMessageById(messageId: string): Promise<void>

  /**
   * Gets the current block height
   * @returns Promise resolving to the block height number
   */
  getBlockHeight(): Promise<number>

  /**
   * Gets the current nonce value
   * @returns Promise resolving to the nonce number
   */
  getNonce(): Promise<number>

  /**
   * Subscribes to a topic
   * @param topic - The topic to subscribe to
   * @param options - Subscription options including nonce, fee, identifier, and meta
   */
  subscribeTopic(topic: string, { nonce, fee, identifier, meta }: { nonce?: number; fee?: number; identifier?: string; meta?: string }): Promise<void>

  /**
   * Unsubscribes from a topic
   * @param topic - The topic to unsubscribe from
   * @param options - Unsubscription options including nonce, fee, identifier, and meta
   */
  unsubscribeTopic(topic: string, { nonce, fee, identifier, meta }: { nonce?: number; fee?: number; identifier?: string; meta?: string }): Promise<void>

  /** 
   * Syncs the subscribers for a topic
   * @param topic - The topic to sync subscribers for
   */
  syncTopicSubscribers(topic: string): Promise<void>

  /**
   * Checks if a topic is subscribed
   * @param topic - The topic to check
   * @param address - The address to check
   * @returns Promise resolving to true if subscribed, false otherwise
   */
  isTopicSubscribed(topic: string, address: string): Promise<boolean>

  /**
   * Gets the list of subscribers for a topic
   * @param topic - The topic to check
   * @returns Promise resolving to array of subscriber addresses
   */
  getTopicSubscribers(topic: string): Promise<string[]>

  /**
   * Gets the number of subscribers for a topic
   * @param topic - The topic to check
   * @returns Promise resolving to the subscriber count
   */
  getTopicSubscribersCount(topic: string): Promise<number>

  /**
   * Gets the list of contacts
   * @param type - Optional contact type
   * @param offset - Optional offset for pagination
   * @param limit - Optional limit for pagination
   * @returns Promise resolving to array of contact addresses
   */
  getContactList({ type, offset, limit }: { type?: ContactType; offset?: number; limit?: number }): Promise<string[]>

  /**
   * Gets contact information by address
   * @param address - The contact's address
   * @returns Promise resolving to contact schema or null if not found
   */
  getContactByAddress(address: string): Promise<ContactSchema | null>

  /**
   * Requests contact data from a specific address
   * @param address - The contact's address
   * @param requestType - Type of data to request ('header' or 'full')
   */
  requestContactData(address: string, requestType: 'header' | 'full'): Promise<void>

  /**
   * Gets or creates a contact
   * @param address - The contact's address
   * @param options - Options including contact type
   * @returns Promise resolving to contact schema or null
   */
  getOrCreateContact(address: string, { type }: { type?: ContactType }): Promise<ContactSchema | null>

  /**
   * Updates contact information
   * @param contact - Partial contact schema with updated information
   */
  updateContact(contact: Partial<IContactSchema>): Promise<void>

  /**
   * Gets topic information
   * @param topic - The topic to get information for
   * @returns Promise resolving to topic schema or null if not found
   */
  getTopicInfo(topic: string): Promise<TopicSchema | null>

  /**
   * Gets topic information from the database
   * @param topic - The topic to get information for
   * @returns Promise resolving to topic schema or null if not found
   */
  getTopicInfoFromDb(topic: string): Promise<TopicSchema | null>

  /**
   * Gets topic subscribers from the database
   * @param topic - The topic to check
   * @returns Promise resolving to array of subscriber addresses
   */
  getTopicSubscribersFromDb(topic: string): Promise<string[]>

  /**
   * Sets a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @returns Promise resolving to the cached value
   */
  setCache(key: string, value: string): Promise<string>

  /**
   * Gets a value from the cache
   * @param key - The cache key
   * @returns Promise resolving to cache schema or undefined if not found
   */
  getCache(key: string): Promise<CacheSchema | undefined>

  /**
   * Deletes a value from the cache
   * @param key - The cache key to delete
   */
  deleteCache(key: string): Promise<void>

  /**
   * Deletes a session
   * @param targetId - The target identifier
   * @param targetType - The type of session
   */
  deleteSession(targetId: string, targetType: SessionType): Promise<void>
}
