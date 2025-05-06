import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { MediaOptions, SessionType } from '@d-chat/core'
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
      this.currentTargetId = topic
      this.currentTargetType = SessionType.TOPIC

      await application.service.call(ServiceType.dchat, 'subscribeTopic', topic)
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
    }
  }
})
