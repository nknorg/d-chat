import { Message, MultiClient, MultiClientOptions, Wallet } from 'nkn-sdk'
import { StoreAdapter } from '../store/storeAdapter'
import { ensureUrl } from '../utils/format'
import { logger } from '../utils/log'
import { getNodeState } from '../utils/rpc'
import { ConnectEvent } from './connectEvent'

const PROTOCOL = location?.protocol === 'https:' ? 'https:' : 'http:'

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected'
}

export class Connect {
  static clients: Record<string, MultiClient> = {}
  static lastSignInId: string | null
  static lastSignInStatus: ConnectionStatus = ConnectionStatus.Disconnected

  static async connect(wallet: Wallet | string) {
    this.lastSignInStatus = ConnectionStatus.Connecting
    if (typeof wallet === 'string') {
      wallet = new Wallet({ seed: wallet })
    }
    const addr = wallet.getPublicKey()
    logger.debug(`connecting. Address: ${addr}`)

    let id: string
    if (PROTOCOL === 'https:') {
      id = await this.newClient({
        seed: wallet.getSeed(),
        // rpcServerAddr: seedRpc,
        webrtc: true,
        // tls: true,
        originalClient: true,
        numSubClients: 8,
        msgHoldingSeconds: 8640000
      })
    } else {
      const rpcServers = await StoreAdapter.rpcServerCache.getRpcServers(addr)

      logger.debug(`RPC servers from cache: ${rpcServers}`)

      const promises: Promise<string>[] = []
      rpcServers.map((url) => {
        promises.push(
          (() => {
            return new Promise((resolve, reject) => {
              getNodeState(url).then((node) => {
                if (node.syncState == 'PERSIST_FINISHED') {
                  return resolve(url)
                }
                return reject()
              })
            })
          })()
        )
      })
      const seedRpc = await Promise.any(promises)
      logger.debug(`measured RPC server: ${seedRpc}`)

      id = await this.newClient({
        seed: wallet.getSeed(),
        rpcServerAddr: seedRpc,
        originalClient: true,
        numSubClients: 4,
        msgHoldingSeconds: 8640000
      })
    }

    this.lastSignInId = id
    const client = this.clients[id]
    client.onConnect(async ({ node }) => {
      logger.info(`connected. Node: ${JSON.stringify(node)}`)
      await StoreAdapter.rpcServerCache.addRpcServer(client.addr, ensureUrl(node.rpcAddr))

      this.lastSignInStatus = ConnectionStatus.Connected
      ConnectEvent.onConnect?.(id, node)
    })

    client.onMessage(async (message: Message) => {
      logger.info(`received message from ${message.src}, payload: ${message.payload}`)
      ConnectEvent.onMessage?.(id, message)
    })
    client.onConnectFailed(() => {
      logger.error(`connect failed. Address: ${client.addr}`)
      ConnectEvent.onConnectFailed?.(id)
    })
    return id
  }

  static async disconnect() {
    const client = await this.getLastSignClient()
    await client.close()
    ConnectEvent.onDisconnect?.(this.lastSignInId)
    delete this.clients[this.lastSignInId]
    this.lastSignInId = null
    this.lastSignInStatus = ConnectionStatus.Disconnected
  }

  static async newClient(options: MultiClientOptions) {
    const wallet = new Wallet({ seed: options.seed })
    const publicKey = wallet.getPublicKey()
    const id = !options.identifier ? publicKey : `${options.identifier}.${publicKey}`
    if (this.clients[id] != null) {
      await this.clients[id].close()
    }
    const client = new MultiClient(options)
    this.clients[client.addr] = client

    return id
  }

  static getLastSignInId() {
    if (this.clients[this.lastSignInId] != null) {
      return this.lastSignInId
    }
    return null
  }

  static getLastSignStatus() {
    return this.lastSignInStatus
  }

  static getLastSignClient() {
    if (this.clients[this.lastSignInId] != null) {
      return this.clients[this.lastSignInId]
    }
  }
}
