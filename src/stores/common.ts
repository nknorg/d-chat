import { Application } from '../common/application'
// import { Chat } from '../common/chat'
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', {
  state: (): { app: Application, versions: any } => {
    return {
      app: new Application(),
      // chat: new Chat(),
      versions: null
    }
  },
  actions: {
    async getVersions() {
      // this.versions = await window.ipc.invoke('versions')
    },


  }
})
