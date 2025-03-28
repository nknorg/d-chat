import { Message, MultiClient, MultiClientOptions, Wallet } from 'nkn-sdk'
import { StoreAdapter } from '../store/storeAdapter'
import { ensureUrl } from '../utils/format.ts'
import { logger } from '../utils/log'
import { getNodeState } from '../utils/rpc'

export class Connect {
  static clients: Record<string, MultiClient> = {}
  static lastSignInId: string

  static async connect(wallet: Wallet | string) {
    if (typeof wallet === 'string') {
      wallet = new Wallet({ seed: wallet })
    }
    const addr = wallet.getPublicKey()
    logger.debug(`connecting. Address: ${addr}`)

    const rpcServers = await StoreAdapter.rpcServerCache.getRpcServers(addr)

    logger.debug(`RPC servers from cache: ${rpcServers}`)

    let promises: Promise<string>[] = []
    rpcServers.map(url => {
      promises.push((() => {
        return new Promise(async (resolve, reject) => {
          let node = await getNodeState(url)
          if (node.syncState == 'PERSIST_FINISHED') {
            return resolve(url)
          }
          return reject()
        })
      })())
    })
    const seedRpc = await Promise.any(promises)
    logger.debug(`measured RPC server: ${seedRpc}`)

    const code = await this.newClient({
      seed: wallet.getSeed(),
      rpcServerAddr: seedRpc,
      originalClient: true,
      numSubClients: 4,
      msgHoldingSeconds: 8640000
    })
    this.lastSignInId = code
    const client = this.clients[code]
    this.clients[code].onConnect(async ({ node }) => {
      logger.debug(`connected. Node: ${JSON.stringify(node)}`)
      await StoreAdapter.rpcServerCache.addRpcServer(client.addr, ensureUrl(node.rpcAddr))
    })

    this.clients[code].onMessage(async (message: Message) => {
      logger.debug(`onMessage: ${message}`)
    })
    this.clients[code].onConnectFailed(() => {
      throw new Error('Connect failed')
    })
    return code
  }

  static async newClient(options: MultiClientOptions) {
    const wallet = new Wallet({ seed: options.seed })
    const publicKey = wallet.getPublicKey()
    const code = !options.identifier ? publicKey : `${options.identifier}.${publicKey}`
    if (this.clients[code] != null) {
      await this.clients[code].close()
    }
    const client = new MultiClient(options)
    this.clients[client.addr] = client

    return code
  }

  static async getLastSignInId() {
    if (this.clients[this.lastSignInId] != null) {
      return this.lastSignInId
    }
    return null
  }

  static async getLastSignClient() {
    if (this.clients[this.lastSignInId] != null) {
      return this.clients[this.lastSignInId]
    }
    throw Error('Client is null')
  }
}
