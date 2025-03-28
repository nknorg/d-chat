import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', {
  state: (): { versions: any } => {
    return {
      versions: null
    }
  },
  actions: {
    async getVersions() {
      // this.versions = await window.ipc.invoke('versions')
    }
  }
})
