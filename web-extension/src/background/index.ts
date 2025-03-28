import { ServiceType } from '@/common/service'
import { Connect, StoreAdapter, logger } from '@d-chat/core'
import { ChromeStorage } from '../chromeStorage'
import { upgrade } from '../upgrade'

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

const services: Record<ServiceType, any> = {
  [ServiceType.Connect]: Connect
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async (): Promise<void> => {
    const result = services[message.service][message.method](...message.args)
    if (result instanceof Promise) {
      sendResponse(await result)
    } else {
      sendResponse(result)
    }
  })()

  return true
})
