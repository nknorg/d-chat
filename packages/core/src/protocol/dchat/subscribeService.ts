import { MultiClient } from 'nkn-sdk'
import { genChannelId } from '../../utils/hash'
import { logger } from '../../utils/log'
import { NknError } from '../error/nknError.ts'
import { log } from 'console'

export const blockHeightTopicSubscribeDefault = 400000 // 93day
export const blockHeightTopicWarnBlockExpire = 100000 // 23day

export class SubscribeService {
  static async subscribe({
    client,
    topic,
    nonce,
    duration,
    fee,
    identifier,
    meta
  }: {
    client: MultiClient
    topic: string
    nonce?: number
    duration?: number
    fee?: number
    identifier?: string
    meta?: string
  }): Promise<string> {
    const topicId = await genChannelId(topic)
    try {
      const result = await client.subscribe(
        topicId,
        duration ?? blockHeightTopicSubscribeDefault,
        identifier,
        meta,
        {
          fee: fee?.toFixed(8),
          attrs: '',
          buildOnly: false,
          nonce
        }
      )
      return result as string
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  static async unsubscribe({
    client,
    topic,
    nonce,
    fee,
    identifier
  }: {
    client: MultiClient
    topic: string
    nonce?: number
    fee?: number
    identifier?: string
  }): Promise<string> {
    const topicId = await genChannelId(topic)
    try {
      const result = await client.unsubscribe(topicId, identifier, {
        fee: fee?.toFixed(8),
        attrs: '',
        buildOnly: false,
        nonce
      })
      return result as string
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  static async getSubscription({
    client,
    topic,
    subscriber
  }: {
    client: MultiClient
    topic: string
    subscriber: string
  }): Promise<{
    meta: string
    expiresAt: number
  }> {
    const topicId = await genChannelId(topic)
    try {
      return await client.getSubscription(topicId, subscriber)
    } catch (e) {
      // if (e.message && e.message.includes(NknError.DoesNotExist)) {
      //   return null
      // }
      logger.error(e)
      throw e
    }
  }

  static async getSubscribers({
    client,
    topic,
    meta = false,
    txPool = true,
    limit = 1000
  }: {
    client: MultiClient
    topic: string
    meta?: boolean
    txPool?: boolean
    limit?: number
  }) {
    const topicId = await genChannelId(topic)
    try {
      let offset = 0
      let allSubscribers = []
      let hasMore = true

      while (hasMore) {
        const subscribers = await client.getSubscribers(topicId, {
          offset,
          limit,
          meta,
          txPool
        })

        let mergerdSubscribers = []
        if (meta) {
          mergerdSubscribers = Object.keys(subscribers.subscribers || {})
          if (txPool) {
            if (subscribers.subscribersInTxPool) {
              mergerdSubscribers = [
                ...mergerdSubscribers,
                ...Object.keys(subscribers.subscribersInTxPool || {})
              ]
            }
          }
        } else {
          mergerdSubscribers = [...(<Array<string>>subscribers.subscribers)]
          if (txPool) {
            mergerdSubscribers = [
              ...mergerdSubscribers,
              ...(<Array<string>>subscribers.subscribersInTxPool)
            ]
          }
        }

        if (!mergerdSubscribers || mergerdSubscribers.length === 0) {
          hasMore = false
        } else {
          allSubscribers = [...allSubscribers, ...mergerdSubscribers]
          offset += mergerdSubscribers.length

          // If we got fewer subscribers than the limit, we've reached the end
          if (mergerdSubscribers.length < limit) {
            hasMore = false
          }
        }
      }
      return allSubscribers
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  static async getSubscribersCount({
    client,
    topic
  }: {
    client: MultiClient
    topic: string
  }): Promise<number> {
    const topicId = await genChannelId(topic)
    try {
      const count = await client.getSubscribersCount(topicId)
      return count
    } catch (e) {
      logger.error(e)
      throw e
    }
  }
}
