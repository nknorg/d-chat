import { addDchatEvents } from '@/common/dchatEvent'
import { services, ServiceType } from '@/common/service'
import { useClientStore } from '@/stores/client'
import { ConnectEvent, ConnectionStatus } from '@d-chat/core'

const clientStore = useClientStore()
// @ts-ignore
ConnectEvent.onConnect = (_id: string, ...args: any[]) => {
  addDchatEvents(services[ServiceType.dchat])
  clientStore.connectStatus = ConnectionStatus.Connected
}

ConnectEvent.onMessage = (_id: string, ...args: any[]) => {
  const [message] = args
  services[ServiceType.dchat].handleMessage(message)
}
// @ts-ignore
ConnectEvent.onConnectFailed = (_id: string, ...args: any[]) => {
  clientStore.connectStatus = ConnectionStatus.Disconnected
}
// @ts-ignore
ConnectEvent.onDisconnect = (_id: string, ...args: any[]) => {
  clientStore.connectStatus = ConnectionStatus.Disconnected
}
