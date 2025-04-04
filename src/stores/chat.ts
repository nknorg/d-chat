import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { defineStore } from 'pinia'
import { Dchat } from '@d-chat/core'

const STORE_NAME = 'chat'
export const useChatStore = defineStore(STORE_NAME, {
  state: (): { dchat: Dchat; targetId?: string } => {
    return {
      targetId: undefined
    }
  },
  actions: {
    async newDchat() {

    },
    async getCurrentChatTargetId() {
      // this.targetId = await window.ipc.invoke(CHANNEL, INSTANCE, 'getCurrentChatTargetId')
    },
    async setCurrentChatTargetId(targetId: string) {
      // await window.ipc.invoke(CHANNEL, INSTANCE, 'setCurrentChatTargetId', targetId)
      // this.targetId = targetId
    },
    async subscribe(
      topic: string,
      {
        identifier = '',
        fee = 0,
        meta = ''
      }: {
        identifier?: string
        fee?: number
        meta?: string
      }
    ) {
      // await window.ipc.invoke(CHANNEL, INSTANCE, 'subscribe', topic, { identifier, fee, meta })
    },
    async sendText(type: SessionType, to: string, msg: string) {
      // let message = await window.ipc.invoke(CHANNEL, INSTANCE, 'sendText', type, to, msg)
      // const messageStore = useMessageStore()
      // messageStore.messageList.unshift(message)
    },
    async sendImage(type: SessionType, to: string, path: string) {
      // let message = await window.ipc.invoke(CHANNEL, INSTANCE, 'sendImage', type, to, path)
      // const messageStore = useMessageStore()
      // messageStore.messageList.unshift(message)
    }
  }
})
