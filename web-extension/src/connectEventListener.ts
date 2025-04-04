import { ConnectionStatus } from '@d-chat/core'
import { useClientStore } from '@/stores/client'

// @ts-ignore
const port = chrome.runtime.connect({ name: 'connect' })
const clientStore = useClientStore()
port.onMessage.addListener(function (msg) {
  if (msg.method == 'onConnect') {
    clientStore.connectStatus = ConnectionStatus.Connected
  } else if (msg.method == 'onMessage') {
  } else if (msg.method == 'onConnectFailed') {
    clientStore.connectStatus = ConnectionStatus.Disconnected
  } else if (msg.method == 'onDisconnect') {
    clientStore.connectStatus = ConnectionStatus.Disconnected
  }
})
export {}
