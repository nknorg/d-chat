import { ILocalStorage } from '../ILocalStorage'
import { LocalStorage } from './localStorage'
import { RpcServerCache } from './rpcServerCache'

export class StoreAdapter {
  private static _localStorage: ILocalStorage = new LocalStorage()
  private static _rpcServerCache: RpcServerCache

  static setLocalStorage(ls: ILocalStorage) {
    this._localStorage = ls
  }

  static get localStorage(): ILocalStorage {
    if (!this._localStorage) {
      this._localStorage = new LocalStorage()
    }
    return this._localStorage
  }

  static setRpcServerCache(ls: ILocalStorage) {
    this._rpcServerCache = new RpcServerCache(ls)
  }

  static get rpcServerCache(): RpcServerCache {
    return this._rpcServerCache
  }
}

export const localStorage = StoreAdapter.localStorage
export const rpcServerCache = StoreAdapter.rpcServerCache
