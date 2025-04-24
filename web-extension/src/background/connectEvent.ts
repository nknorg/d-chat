import { ServiceType } from '@/common/service'
import { ConnectEvent, MessageSchema, SessionSchema } from '@d-chat/core'
import { EventEmitter } from 'events'
import { dchatEventEmitter } from './dchatEvent'
import { services } from './services'

class ConnectEventEmitter extends EventEmitter {}

const connectEventEmitter = new ConnectEventEmitter()

ConnectEvent.onConnect = (_id: string, ...args: any[]) => {
  services[ServiceType.dchat].init()
  services[ServiceType.dchat].addMessage = (message: MessageSchema) => {
    dchatEventEmitter.emit('addMessage', message)
  }
  services[ServiceType.dchat].updateSession = (session: SessionSchema) => {
    dchatEventEmitter.emit('updateSession', session)
  }
  connectEventEmitter.emit('onConnect', _id, ...args)
}

ConnectEvent.onMessage = (_id: string, ...args: any[]) => {
  connectEventEmitter.emit('onMessage', _id, ...args)
  const [message] = args
  services[ServiceType.dchat].handleMessage(message)
}

ConnectEvent.onConnectFailed = (_id: string, ...args: any[]) => {
  connectEventEmitter.emit('onConnectFailed', _id, ...args)
}

ConnectEvent.onDisconnect = (_id: string, ...args: any[]) => {
  connectEventEmitter.emit('onDisconnect', _id, ...args)
}

// Every page that connects to the background script will have a unique port
const connectedPorts = new Map<string, chrome.runtime.Port>()

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'connect') {
    connectedPorts.set(port.sender!.url!, port)

    const onConnectHandler = (_id: string, ...args: any[]) => {
      const connectPort = connectedPorts.get(port.sender!.url!)
      if (connectPort) {
        connectPort.postMessage({ method: 'onConnect', id: _id, args })
      }
    }

    const onMessageHandler = (_id: string, ...args: any[]) => {
      const connectPort = connectedPorts.get(port.sender!.url!)
      if (connectPort) {
        connectPort.postMessage({ method: 'onMessage', id: _id, args })
      }
    }

    const onConnectFailedHandler = (_id: string, ...args: any[]) => {
      const connectPort = connectedPorts.get(port.sender!.url!)
      if (connectPort) {
        connectPort.postMessage({ method: 'onConnectFailed', id: _id, args })
      }
    }

    const onDisconnectHandler = (_id: string, ...args: any[]) => {
      const connectPort = connectedPorts.get(port.sender!.url!)
      if (connectPort) {
        connectPort.postMessage({ method: 'onDisconnect', id: _id, args })
      }
    }

    connectEventEmitter.on('onConnect', onConnectHandler)
    connectEventEmitter.on('onMessage', onMessageHandler)
    connectEventEmitter.on('onConnectFailed', onConnectFailedHandler)
    connectEventEmitter.on('onDisconnect', onDisconnectHandler)

    port.onDisconnect.addListener(() => {
      connectEventEmitter.off('onConnect', onConnectHandler)
      connectEventEmitter.off('onMessage', onMessageHandler)
      connectEventEmitter.off('onConnectFailed', onConnectFailedHandler)
      connectEventEmitter.off('onDisconnect', onDisconnectHandler)
      connectedPorts.delete(port.sender!.url!)
    })
  }
})
