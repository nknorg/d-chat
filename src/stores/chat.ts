import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { logger, MediaOptions, SessionType, NknError } from '@d-chat/core'
import { defineStore } from 'pinia'

const STORE_NAME = 'chat'
export const useChatStore = defineStore(STORE_NAME, {
  state: (): { currentTargetId?: string; currentTargetType?: SessionType } => {
    return {
      currentTargetId: undefined,
      currentTargetType: undefined
    }
  },
  actions: {
    async getCurrentChatTargetId() {
      this.currentTargetId = await application.service.call(ServiceType.dchat, 'getCurrentChatTargetId')
    },
    async setCurrentChatTargetId(targetId: string) {
      await application.service.call(ServiceType.dchat, 'setCurrentChatTargetId', targetId)
      this.currentTargetId = targetId
    },
    async subscribeTopic(topic: string) {
      await application.service.call(ServiceType.dchat, 'subscribeTopic', topic)
    },
    async unsubscribeTopic(topic: string) {
      try {
        await application.service.call(ServiceType.dchat, 'unsubscribeTopic', topic)
      } catch (e) {
        if (e.message?.includes(NknError.DoesNotExist)) {
          logger.debug('Topic already unsubscribed:', topic)
          return
        } else if (e.message?.includes(NknError.DuplicateSubscription)) {
          logger.debug('Topic already subscribed:', topic)
          return
        }
        throw e
      }
    },
    async deleteTopic(topic: string) {
      try {
        // First unsubscribe from the topic
        await this.unsubscribeTopic(topic)
        // Then delete the session
        await this.deleteSession(topic, SessionType.TOPIC)
      } catch (e) {
        logger.error('Failed to delete topic:', e)
        throw e
      }
    },
    async sendText(type: SessionType = SessionType.CONTACT, to: string, msg: string) {
      await application.service.call(ServiceType.dchat, 'sendText', type, to, msg)
    },
    async sendAudio(type: SessionType, to: string, data: string, options?: MediaOptions) {
      await application.service.call(ServiceType.dchat, 'sendAudio', type, to, data, options)
    },
    async sendImage(type: SessionType, to: string, path: string) {
      // let message = await window.ipc.invoke(CHANNEL, INSTANCE, 'sendImage', type, to, path)
      // const messageStore = useMessageStore()
      // messageStore.messageList.unshift(message)
    },
    async syncTopicSubscribers(topic: string) {
      await application.service.call(ServiceType.dchat, 'syncTopicSubscribers', topic)
    },
    async getTopicSubscribersFromDb(topic: string) {
      return await application.service.call(ServiceType.dchat, 'getTopicSubscribersFromDb', topic)
    },
    async deleteSession(targetId: string, targetType: SessionType) {
      await application.service.call(ServiceType.dchat, 'deleteSession', targetId, targetType)
      // If current chat is the deleted session, clear current target
      if (this.currentTargetId === targetId) {
        this.currentTargetId = undefined
        this.currentTargetType = undefined
      }
    },
    async requestContactData(address: string, requestType: 'header' | 'full' = 'full') {
      try {
        await application.service.call(ServiceType.dchat, 'requestContactData', address, requestType)
      } catch (e) {
        // If error is DuplicateSubscription, we can ignore it as it means we're already requesting
        if (e.message?.includes(NknError.DuplicateSubscription)) {
          logger.debug('Contact data already requested:', address)
          return
        }
        throw e
      }
    }
  }
})
