import { ServiceType } from '@/common/service'
import { bytesToHex, ContactSchema, logger, MessageContentType, MessageSchema, SessionType } from '@d-chat/core'
import { Message } from 'nkn-sdk'
import { ChromeStorage } from '../chromeStorage'
import { services } from './services'

const KEY_ENABLE_NOTIFICATION = 'settings:enable-notification'
const KEY_ENABLE_NOTIFICATION_SOUND = 'settings:enable-notification-sound'
const storage = new ChromeStorage('sync')

export class NotificationManager {
  private static instance: NotificationManager

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  public initMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'UPDATE_BADGE_COUNT') {
        this.updateUnreadCount()
          .then(() => {
            sendResponse({ success: true })
          })
          .catch((error) => {
            logger.error('Failed to update unread count:', error)
            sendResponse({ success: false, error: error.message })
          })
        return true
      }
    })
  }

  private async getEnableNotification(): Promise<boolean> {
    const value = await storage.get(KEY_ENABLE_NOTIFICATION)
    return value as boolean
  }

  private async getEnableNotificationSound(): Promise<boolean> {
    const value = await storage.get(KEY_ENABLE_NOTIFICATION_SOUND)
    return value as boolean
  }

  private async getMessageByMessageId(messageId: Uint8Array): Promise<MessageSchema> {
    try {
      return await services[ServiceType.dchat].getMessageByMessageId(bytesToHex(messageId))
    } catch (error) {
      logger.error('Failed to get message by messageId:', error)
      return null
    }
  }

  private async getContactInfo(address: string) {
    try {
      return await services[ServiceType.dchat].getOrCreateContact(address, { type: 0 })
    } catch (error) {
      logger.error('Failed to get contact info:', error)
      return null
    }
  }

  private async showBrowserNotification(message: MessageSchema, contactInfo: ContactSchema) {
    let messageContent: string | null = null

    switch (message.payload.contentType) {
      case MessageContentType.text:
        messageContent = message.payload.content
        break
      case MessageContentType.image:
        messageContent = '🖼'
        break
      case MessageContentType.audio:
        messageContent = '🎤'
        break
      default:
        return
    }

    const options: chrome.notifications.NotificationOptions = {
      type: 'basic',
      priority: 2,
      title: message.targetType === SessionType.TOPIC ? message.payload.topic : contactInfo.displayName,
      message:
        message.targetType === SessionType.TOPIC ? `${contactInfo.displayName}: ${messageContent}` : messageContent,
      iconUrl: 'assets/d-chat/logo.png',
      silent: !(await this.getEnableNotificationSound())
    }

    chrome.notifications.create('', options, (notificationId) => {
      // Handle notification click
      chrome.notifications.onClicked.addListener((clickedId) => {
        if (clickedId === notificationId) {
          // Open extension page
          chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
          })
        }
      })
    })
  }

  public async updateUnreadCount() {
    try {
      // Get unread message count
      logger.debug('Update unread count')
      const unreadCount = await services[ServiceType.dchat].getUnreadMessageCount()
      logger.debug('Unread count:', unreadCount)
      if (unreadCount > 0) {
        chrome.action.setBadgeText({ text: unreadCount.toString() })
      } else {
        chrome.action.setBadgeText({ text: '' })
      }
    } catch (error) {
      logger.error('Failed to update unread count:', error)
    }
  }

  public async handleNewMessage(raw: Message) {
    // Check if notification is enabled
    const enableNotification = await this.getEnableNotification()
    if (!enableNotification) {
      return
    }

    // Check if the message is from a contact
    const message = await this.getMessageByMessageId(raw.messageId)
    if (!message) {
      return
    }

    // Get contact info
    const contactInfo = await this.getContactInfo(message.sender)
    if (!contactInfo) {
      return
    }

    await this.showBrowserNotification(message, contactInfo)
    await this.updateUnreadCount()
  }
}
