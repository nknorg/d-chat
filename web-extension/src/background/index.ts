import { logger, StoreAdapter, ConnectionStatus } from '@d-chat/core'
import { ServiceType } from '@/common/service'
import { ChromeStorage } from '../chromeStorage'
import { NotificationManager } from './notification'
import { services } from './services'
import { upgrade } from '../upgrade'
import { AutoLoginManager } from './autoLogin'
import './connectEvent'
import './dchatEvent'

StoreAdapter.setLocalStorage(new ChromeStorage('sync'))
StoreAdapter.setRpcServerCache(new ChromeStorage('local'))

const ALARM_NAME = 'monitorLogin'

// Function to ensure alarm exists
async function ensureAlarm() {
  try {
    const alarm = await chrome.alarms.get(ALARM_NAME)
    if (!alarm) {
      logger.info('Creating monitor login alarm')
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
    }
  } catch (error) {
    logger.error('Failed to check/create alarm:', error)
  }
}

// Create alarm when service worker starts
ensureAlarm()

// Also create alarm on startup
chrome.runtime.onStartup.addListener(() => {
  logger.info('Service worker starting up, ensuring alarm exists')
  ensureAlarm()
})

// Handle alarm to check login status and reconnect if needed
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    try {
      // First ensure alarm still exists for next time
      await ensureAlarm()
      
      const currentStatus = services[ServiceType.Connect].getLastSignStatus()
      logger.debug('Login status check:', currentStatus)
      
      if (currentStatus !== ConnectionStatus.Connected) {
        logger.info('Login status disconnected, attempting to reconnect...')
        const autoLoginManager = AutoLoginManager.getInstance()
        await autoLoginManager.tryAutoLogin()
      }
    } catch (error) {
      logger.error('Login status check failed:', error)
    }
  }
})

chrome.runtime.onInstalled.addListener(async (opt) => {
  if (opt.reason === 'install') {
    await upgrade()
    return
  }

  if (opt.reason === 'update') {
    await upgrade()
    return
  }
})

NotificationManager.getInstance().initMessageListener()

// Try auto login when extension starts
const autoLoginManager = AutoLoginManager.getInstance()
autoLoginManager.tryAutoLogin().catch((error) => {
  logger.error('Auto login failed:', error)
})

// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async (): Promise<void> => {
    if (message.type === 'service') {
      const result = services[message.service][message.method](...message.args)
      if (result instanceof Promise) {
        // @ts-ignore
        sendResponse(await result)
      } else {
        // @ts-ignore
        sendResponse(result)
      }
    }
  })()

  return true
})
