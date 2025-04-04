import { StoreAdapter } from '@d-chat/core'
import { ChromeStorage } from '../chromeStorage'
import { services } from './services'
import { upgrade } from '../upgrade'
import './connectEvent'
import './dchatEvent'

StoreAdapter.setLocalStorage(new ChromeStorage('sync'))
StoreAdapter.setRpcServerCache(new ChromeStorage('local'))

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async (): Promise<void> => {
    if (message.type === 'service') {
      const result = services[message.service][message.method](...message.args)
      if (result instanceof Promise) {
        sendResponse(await result)
      } else {
        sendResponse(result)
      }
    }
  })()

  return true
})
