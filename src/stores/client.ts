import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { defineStore } from 'pinia'

const STORE_NAME = 'client'
export const useClientStore = defineStore(STORE_NAME, {
  state: (): { lastSignInId: string | null } => {
    return {
      lastSignInId: null
    }
  },
  actions: {
    async connect(seed: string) {
      this.lastSignInId = await application.service.call(ServiceType.Connect, 'connect', seed)
      return this.lastSignInId
    },
    async disconnect() {
      // await window.ipc.invoke(CHANNEL, 'signOut')
      this.lastSignInId = null
    },
    async getLastSignInId() {
      this.lastSignInId = await application.service.call(ServiceType.Connect, 'getLastSignInId')
      return this.lastSignInId
    }
  }
})
