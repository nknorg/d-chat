import { StoreAdapter } from '@d-chat/core'
import { defineStore } from 'pinia'

const STORE_NAME = 'settings'

export const useSettingStore = defineStore('setting', {
  state: (): { locale: string | null } => {
    return {
      locale: null
    }
  },
  actions: {
    async get(key: string) {
      return await StoreAdapter.localStorage.get(`${STORE_NAME}:${key}`)
    },
    async set(key: string, val: string) {
      return await StoreAdapter.localStorage.set(`${STORE_NAME}:${key}`, val)
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
    }
  }
})
