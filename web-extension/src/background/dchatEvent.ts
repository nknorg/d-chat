import { MessageSchema } from '@d-chat/core'
import { EventEmitter } from 'events'

class DchatEventEmitter extends EventEmitter {}

export const dchatEventEmitter = new DchatEventEmitter()

// Every page that connects to the background script will have a unique port
const connectedPorts = new Map<string, chrome.runtime.Port>()

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'dchat') {
    connectedPorts.set(port.sender!.url!, port)

    const addMessageHandler = (message: MessageSchema) => {
      const connectPort = connectedPorts.get(port.sender!.url!)
      if (connectPort) {
        connectPort.postMessage({ method: 'addMessage', message })
      }
    }

    dchatEventEmitter.on('addMessage', addMessageHandler)

    port.onDisconnect.addListener(() => {
      dchatEventEmitter.off('addMessage', addMessageHandler)
      connectedPorts.delete(port.sender!.url!)
    })
  }
})
