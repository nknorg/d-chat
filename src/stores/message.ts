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

      // If it's a received message and we're in the chat page, mark it as read
      if (!message.isOutbound) {
        await application.service.call(ServiceType.dchat, 'readMessageById', message.payload.id)
      }
    },
    async updateMessage(message: MessageSchema) {
      const index = this.messageList.findIndex((item) => {
        if (!item.messageId || !message.messageId) return false

        // Convert both to arrays of values
        const itemValues = Object.values(item.messageId)
        const messageValues = Object.values(message.messageId)

        if (itemValues.length !== messageValues.length) return false
        return itemValues.every((value, index) => value === messageValues[index])
      })
      if (index !== -1) {
        this.messageList[index] = message
      }
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
