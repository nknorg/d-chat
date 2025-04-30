import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { MessageSchema, SessionType } from '@d-chat/core'
import { defineStore } from 'pinia'

const STORE_NAME = 'message'

export const useMessageStore = defineStore(STORE_NAME, {
  state: (): { messageList: MessageSchema[] } => {
    return {
      messageList: []
    }
  },
  actions: {
    async addMessage(message: MessageSchema) {
      this.messageList.unshift(message)
    },
    async getHistoryMessages(
      targetId: string,
      targetType: SessionType,
      options: {
        offset?: number
        limit?: number
      } = {
        offset: 0,
        limit: 50
      }
    ) {
      const records = await application.service.call(ServiceType.dchat, 'getHistoryMessages', targetId, targetType, options)
      if (records && records.length > 0) {
        this.messageList = [...new Set([...this.messageList, ...records])]
      }
      return records
    }
  }
})
