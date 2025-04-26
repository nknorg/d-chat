import { defineStore } from 'pinia'
import { push } from 'notivue'

const STORE_NAME = 'notification'

interface NotificationOptions {
  title?: string
  message: string
}

export const useNotificationStore = defineStore(STORE_NAME, {
  state: (): {} => {
    return {}
  },
  actions: {
    success(options: NotificationOptions) {
      push.success(options)
    },
    error(options: NotificationOptions) {
      push.error(options)
    },
    warning(options: NotificationOptions) {
      push.warning(options)
    },
    info(options: NotificationOptions) {
      push.info(options)
    }
  }
})
