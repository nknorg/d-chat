import { defineStore } from 'pinia'
import { push } from 'notivue'

const STORE_NAME = 'notification'

export enum NotificationType {
  DEFAULT = 'default',
  REQUEST_PERMISSION = 'request-permission'
}

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
      push.success({
        ...options,
        props: {
          type: NotificationType.DEFAULT
        }
      })
    },
    error(options: NotificationOptions) {
      push.error({
        ...options,
        props: {
          type: NotificationType.DEFAULT
        }
      })
    },
    warning(options: NotificationOptions) {
      push.warning({
        ...options,
        props: {
          type: NotificationType.DEFAULT
        }
      })
    },
    info(options: NotificationOptions) {
      push.info({
        ...options,
        props: {
          type: NotificationType.DEFAULT
        }
      })
    },
    requestPermission(options: NotificationOptions) {
      push.info({
        ...options,
        props: {
          type: NotificationType.REQUEST_PERMISSION
        }
      })
    }
  }
})
