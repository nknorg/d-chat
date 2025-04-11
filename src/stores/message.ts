import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { IMessageSchema, SessionType } from '@d-chat/core'
import { defineStore } from 'pinia'

const STORE_NAME = 'message'

export const useMessageStore = defineStore(STORE_NAME, {
  state: (): { messageList: IMessageSchema[] } => {
    return {
      messageList: []
    }
  },
  actions: {
    async addMessage(message: IMessageSchema) {
      this.messageList.unshift(message)
    },
    async getHistoryMessages(
      targetId: string,
      targetType: SessionType,
      limit: number = 20,
      offset: number = 0
    ) {
      const records = await application.service.call(
        ServiceType.dchat,
        'getHistoryMessages',
        targetId,
        targetType,
        limit,
        offset
      )
      this.messageList = records
      return records
    }
  }
})
