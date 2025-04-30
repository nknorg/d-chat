import { application } from '@/common/application'
import { CacheSchema, CacheService, StoreAdapter } from '@d-chat/core'
import { defineStore } from 'pinia'

import { useClientStore } from './client'

const STORE_NAME = 'cache'

interface CacheState {
  cacheMap: Record<string, CacheSchema>
}

export const useCacheStore = defineStore(STORE_NAME, {
  state: (): CacheState => ({
    cacheMap: {}
  }),

  actions: {
    async getCache(id: string): Promise<CacheSchema | undefined> {
      const cached = this.cacheMap[id]
      if (cached) {
        return cached
      }

      if (process.env.__APP_PLATFORM__ === 'electron') {
        // TODO
        throw new Error('Electron cache storage not implemented')
      } else if (process.env.__APP_PLATFORM__ === 'webext') {
        const cache = await CacheService.getCache({
          // @ts-ignore
          db: application.db.getLastOpenedDb(),
          id
        })
        if (cache) {
          this.cacheMap[id] = cache
        }
        return cache
      } else {
        const cache = await CacheService.getCache({
          db: StoreAdapter.db.getLastOpenedDb(),
          id
        })
        if (cache) {
          this.cacheMap[id] = cache
        }
        return cache
      }
    },

    async setCache(name: string, value: any): Promise<string> {
      if (process.env.__APP_PLATFORM__ === 'electron') {
        // TODO
        throw new Error('Electron cache storage not implemented')
      } else if (process.env.__APP_PLATFORM__ === 'webext') {
        const id = await CacheService.setCache({
          // @ts-ignore
          db: application.db.getLastOpenedDb(),
          name,
          value
        })
        const cache = await this.getCache(id)
        if (cache) {
          this.cacheMap[id] = cache
        }
        return id
      } else {
        const id = await CacheService.setCache({
          db: StoreAdapter.db.getLastOpenedDb(),
          name,
          value
        })
        const cache = await this.getCache(id)
        if (cache) {
          this.cacheMap[id] = cache
        }
        return id
      }
    },

    async setAvatar(value: any): Promise<string> {
      const clientStore = useClientStore()
      const address = clientStore.lastSignInId
      const name = `avatar_${address}`
      return await this.setCache(name, value)
    },

    clearCache(id: string) {
      delete this.cacheMap[id]
    },

    clearAllCache() {
      this.cacheMap = {}
    }
  }
})
