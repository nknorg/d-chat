import { push } from 'notivue'
import { defineStore } from 'pinia'
import { useSettingStore } from './setting'
import { MessageContentType, MessageSchema } from '@d-chat/core'

const STORE_NAME = 'notification'

export enum NotificationType {
  DEFAULT = 'default',
  REQUEST_PERMISSION = 'request-permission',
  MESSAGE_NOTIFICATION = 'message-notification'
}

interface NotificationOptions {
  title?: string
  message: string
}

interface State {
  soundComponent: { playSound: () => void } | null
}

export const useNotificationStore = defineStore(STORE_NAME, {
  state: (): State => ({
    soundComponent: null
  }),
  actions: {
    setSoundComponent(component: { playSound: () => void }) {
      this.soundComponent = component
    },
    async playNotificationSound() {
      const settingStore = useSettingStore()
      const enableNotificationSound = await settingStore.getEnableNotificationSound()
      if (enableNotificationSound && this.soundComponent) {
        this.soundComponent.playSound()
      }
    },
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
    },
    async notification(message: MessageSchema) {
      const settingStore = useSettingStore()
      const enableNotification = await settingStore.getEnableNotification()
      if (!enableNotification) {
        return
      }
      // Check message type
      if (![MessageContentType.text, MessageContentType.media, MessageContentType.image, MessageContentType.audio].includes(message.payload.contentType)) {
        return
      }

      this.playNotificationSound()
      push.info({
        props: {
          type: NotificationType.MESSAGE_NOTIFICATION,
          message: message
        }
      })
    }
  }
})
