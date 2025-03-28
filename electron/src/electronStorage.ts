import { ILocalStorage } from '@d-chat/core'
import Store from 'electron-store'

const store = new Store()

export class ElectronStorage implements ILocalStorage {
  async get<T>(key: string): Promise<T | undefined> {
    return store.get(key) as T
  }

  async set<T>(key: string, value: T): Promise<void> {
    store.set(key, value)
  }

  async remove(key: string): Promise<void> {
    store.delete(key)
  }

  async setList<T>(key: string, data: T[] | Record<string, T>): Promise<void> {
    const isArray = Array.isArray(data)
    const keys: string[] = []

    if (isArray) {
      for (let i = 0; i < data.length; i++) {
        const subKey = `${key}:${i}`
        keys.push(`${i}`)
        await this.set(subKey, data[i])
      }
    } else {
      for (const k in data) {
        const subKey = `${key}:${k}`
        keys.push(k)
        await this.set(subKey, data[k])
      }
    }

    await this.set(`${key}:_items`, keys)
  }

  async getList<T>(key: string): Promise<T[] | Record<string, T> | undefined> {
    const keys = await this.get<string[]>(`${key}:_items`)
    if (!keys) return undefined

    const result: any = keys.every(k => /^\d+$/.test(k)) ? [] : {}
    for (const subKey of keys) {
      const item = await this.get<T>(`${key}:${subKey}`)
      if (Array.isArray(result)) {
        result.push(item)
      } else {
        result[subKey] = item
      }
    }
    return result
  }

  async removeList(key: string): Promise<void> {
    const keys = await this.get<string[]>(`${key}:_items`)
    if (keys) {
      for (const subKey of keys) {
        await this.remove(`${key}:${subKey}`)
      }
      await this.remove(`${key}:_items`)
    }
  }

  async setItem<T>(key: string, index: number | string, value: T): Promise<void> {
    await this.set(`${key}:${index}`, value)

    const items = await this.get<string[]>(`${key}:_items`) || []
    const strIndex = String(index)
    if (!items.includes(strIndex)) {
      items.push(strIndex)
      await this.set(`${key}:_items`, items)
    }
  }

  async getItem<T>(key: string, index: number | string): Promise<T | undefined> {
    return this.get<T>(`${key}:${index}`)
  }

  async getListSize(key: string): Promise<number> {
    const items = await this.get<string[]>(`${key}:_items`)
    return items?.length || 0
  }

  async clear(): Promise<void> {
    store.clear()
  }
}
