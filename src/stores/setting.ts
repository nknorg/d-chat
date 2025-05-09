import { StoreAdapter } from '@d-chat/core'
import { defineStore } from 'pinia'

const STORE_NAME = 'settings'

const KEY_LOCALE = 'locale'
const KEY_THEME = 'theme'
const KEY_ENABLE_NOTIFICATION = 'enable-notification'
const KEY_ENABLE_NOTIFICATION_SOUND = 'enable-notification-sound'

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
      const locale = await this.get(KEY_LOCALE)
      this.locale = locale
      return locale
    },
    async setLocale(val: string) {
      this.locale = val
      return this.set(KEY_LOCALE, val)
    },
    async getTheme() {
      return await this.get(KEY_THEME)
    },
    async setTheme(val: string) {
      return this.set(KEY_THEME, val)
    },
    async getEnableNotification() {
      return await this.get(KEY_ENABLE_NOTIFICATION)
    },
    async setEnableNotification(val: boolean) {
      return this.set(KEY_ENABLE_NOTIFICATION, val)
    },
    async getEnableNotificationSound() {
      return await this.get(KEY_ENABLE_NOTIFICATION_SOUND)
    },
    async setEnableNotificationSound(val: boolean) {
      return this.set(KEY_ENABLE_NOTIFICATION_SOUND, val)
    }
  }
})
