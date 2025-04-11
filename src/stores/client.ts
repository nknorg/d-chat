import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { ConnectionStatus } from '@d-chat/core'
import { Wallet } from 'nkn-sdk'
import { defineStore } from 'pinia'

const STORE_NAME = 'client'

export const useClientStore = defineStore(STORE_NAME, {
  state: (): {
    lastSignInId: string | null
    connectStatus: ConnectionStatus
  } => {
    return {
      lastSignInId: null,
      connectStatus: ConnectionStatus.Disconnected
    }
  },
  actions: {
    async connect(seed: string) {
      this.connectStatus = ConnectionStatus.Connecting
      const wallet = new Wallet({ seed })
      await application.service.call(ServiceType.Db, 'openDb', wallet.getPublicKey(), seed)
      application.service.call(ServiceType.dchat, 'init')
      this.lastSignInId = await application.service.call(ServiceType.Connect, 'connect', seed)
      return this.lastSignInId
    },
    async disconnect() {
      this.lastSignInId = await application.service.call(ServiceType.Connect, 'disconnect')
      this.lastSignInId = null
      this.connectStatus = ConnectionStatus.Disconnected
    },
    async getLastSignInId() {
      this.lastSignInId = await application.service.call(ServiceType.Connect, 'getLastSignInId')
      return this.lastSignInId
    },
    async getLastSignInStatus() {
      this.connectStatus = await application.service.call(ServiceType.Connect, 'getLastSignStatus')
      return this.connectStatus
    }
  }
})
