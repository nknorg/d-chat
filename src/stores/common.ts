import { StoreAdapter } from '@d-chat/core'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

let localStorage
if (process.env.__APP_PLATFORM__ == 'electron') {
} else if (process.env.__APP_PLATFORM__ == 'webext') {
  const module = await import('../../web-extension/src/chromeStorage')
  localStorage = new module.ChromeStorage('local')
} else {
  localStorage = StoreAdapter.localStorage
}

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
        deviceId = uuidv4()
        await localStorage.set(`deviceId`, deviceId)
      }
      this.deviceId = deviceId
      return deviceId
    }
  }
})
