import { application } from '@/common/application'
import { defineStore } from 'pinia'

const STORE_NAME = 'settings'


export const useSettingStore = defineStore('setting', {
  state: () => {
    return {
      locale: null
    }
  },
  actions: {
    async get(key: string) {
      return await application.localStorage.get(`${STORE_NAME}:${key}`)
    },
    async set(key: string, val: string) {
      return await application.localStorage.set(`${STORE_NAME}:${key}`, val)
    },
    async getLocale() {
      const locale = await this.get('locale')
      this.locale = locale
      return locale
    },
    async setLocale(val: string) {
      return this.set('locale', val)
    },
    async getTheme() {
      return await this.get('theme')
    },
    async setTheme(val: string) {
      return this.set('theme', val)
    },
    async getDefaultWallet() {
      return await this.get('wallet')
    },
    async setDefaultWallet(val: string) {
      return this.set('wallet', val)
    }
  }
})
