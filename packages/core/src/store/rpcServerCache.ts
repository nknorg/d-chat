import { ILocalStorage } from '../ILocalStorage'
import { logger } from '../utils/log'
import { getNodeState } from '../utils/rpc'

const defaultSeedRpcList: string[] = [
  'http://seed.nkn.org:30003',
  'http://mainnet-seed-0001.nkn.org:30003',
  'http://mainnet-seed-0002.nkn.org:30003',
  'http://mainnet-seed-0003.nkn.org:30003',
  'http://mainnet-seed-0004.nkn.org:30003',
  'http://mainnet-seed-0005.nkn.org:30003',
  'http://mainnet-seed-0006.nkn.org:30003',
  'http://mainnet-seed-0007.nkn.org:30003',
  'http://mainnet-seed-0008.nkn.org:30003'
]
const RPC_SERVERS_KEY = 'rpc_servers'
const rpcServerMeasureTimeout = 3 * 1000 // 3s

export class RpcServerCache {
  public storage: ILocalStorage

  constructor(storage?: ILocalStorage) {
    if (storage) {
      this.storage = storage
    }
  }

  async getRpcServers(key: string): Promise<string[]> {
    let servers = defaultSeedRpcList
    const cachedServers = ((await this.storage.getList(`${RPC_SERVERS_KEY}`)) as string[]) || []
    // merge and deduplicate
    servers = [...new Set([...servers, ...cachedServers])]
    return servers
  }

  async setRpcServers(key: string, servers: string[]): Promise<void> {
    const uniqueServers = [...new Set(servers)]
    await this.storage.setList(`${RPC_SERVERS_KEY}`, uniqueServers)
  }

  async addRpcServer(key: string, server: string): Promise<void> {
    const servers = ((await this.storage.getList(`${RPC_SERVERS_KEY}`)) as string[]) || []
    servers.unshift(server)
    await this.setRpcServers(key, servers.slice(0, 10))
  }

  async measureRpcServers(servers: string[]): Promise<string[]> {
    let rpcAddrs = []
    const result = await Promise.all(
      servers.map(async (server) => {
        try {
          const node = await getNodeState(server)
          if (node.syncState == 'PERSIST_FINISHED') {
            rpcAddrs.push(server)
          }
        } catch (e) {
          logger.error(`Failed to connect to ${server}, error: ${e}`)
        }
      })
    )
    return rpcAddrs
  }
}
