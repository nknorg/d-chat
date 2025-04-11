import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { SessionSchema, SessionType } from '@d-chat/core'
import { defineStore } from 'pinia'

const STORE_NAME = 'session'
export const useSessionStore = defineStore(STORE_NAME, {
  state: (): { sessionList: SessionSchema[] } => {
    return {
      sessionList: []
    }
  },
  actions: {
    async queryListRecent(limit: number = 20, offset: number = 0) {
      const records = await application.service.call(
        ServiceType.dchat,
        'getSessionList',
        limit,
        offset
      )
      this.sessionList = records ?? []
    },
    async queryByTargetId(targetId: string, targetType: SessionType = SessionType.CONTACT) {
      return await application.service.call(
        ServiceType.dchat,
        'getSessionByTargetId',
        targetId,
        targetType
      )
    },
    async updateSession(data: SessionSchema) {
      for (let i = 0; i < this.sessionList.length; i++) {
        if (this.sessionList[i].targetId == data.targetId) {
          this.sessionList[i] = data
          return
        }
      }
      this.sessionList.unshift(data)
    },
    async readAllMessagesByTargetId(targetId: string, targetType: SessionType) {
      await application.service.call(
        ServiceType.dchat,
        'readAllMessagesByTargetId',
        targetId,
        targetType
      )
      const sess = this.sessionList.find(x => x.targetId == targetId)
      if (sess != null) {
        sess.unReadCount = 0
      }
    }
  }
})
