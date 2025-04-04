import { localStorage } from '@d-chat/core'
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', {
  state: (): { versions: any; deviceId: string } => {
    return {
      versions: null,
      deviceId: ''
    }
  },
  actions: {
    async getVersions() {
      // this.versions = await window.ipc.invoke('versions')
    },
    async getDeviceId() {
      let deviceId: string = (await localStorage.get(`deviceId`)) as string
      if (!deviceId) {
        deviceId = crypto.randomUUID().toString()
        await localStorage.set(`deviceId`, deviceId)
      }
      this.deviceId = deviceId
      return deviceId
    }
  }
})
