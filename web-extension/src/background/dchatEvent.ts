import { MessageSchema, SessionSchema } from '@d-chat/core'
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

    const updateSessionHandler = (session: SessionSchema) => {
      const connectPort = connectedPorts.get(port.sender!.url!)
      if (connectPort) {
        connectPort.postMessage({ method: 'updateSession', session })
      }
    }

    dchatEventEmitter.on('addMessage', addMessageHandler)
    dchatEventEmitter.on('updateSession', updateSessionHandler)

    port.onDisconnect.addListener(() => {
      dchatEventEmitter.off('addMessage', addMessageHandler)
      dchatEventEmitter.off('updateSession', updateSessionHandler)
      connectedPorts.delete(port.sender!.url!)
    })
  }
})
