import { ILocalStorage } from '../ILocalStorage'

const INDEX_SUFFIX = '_index'
export class LocalStorage implements ILocalStorage {
  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = localStorage.getItem(key)
    try {
      return raw ? JSON.parse(raw) : undefined
    } catch {
      return undefined
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }

  async setList<T>(key: string, data: T[] | Record<string, T>): Promise<void> {
    const isArray = Array.isArray(data)
    const keys: string[] = []

    if (isArray) {
      for (let i = 0; i < data.length; i++) {
        const itemKey = `${key}:${i}`
        keys.push(`${i}`)
        await this.set(itemKey, data[i])
      }
    } else {
      for (const k in data) {
        const itemKey = `${key}:${k}`
        keys.push(k)
        await this.set(itemKey, data[k])
      }
    }

    await this.set(`${key}:${INDEX_SUFFIX}`, keys)
  }

  async getList<T>(key: string): Promise<T[] | Record<string, T> | undefined> {
    const keys = await this.get<string[]>(`${key}:${INDEX_SUFFIX}`)
    if (!keys) return undefined

    const result: any = Array.isArray(keys) && keys.every(k => /^\d+$/.test(k)) ? [] : {}
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
    const keys = await this.get<string[]>(`${key}:${INDEX_SUFFIX}`)
    if (keys) {
      for (const subKey of keys) {
        await this.remove(`${key}:${subKey}`)
      }
      await this.remove(`${key}:${INDEX_SUFFIX}`)
    }
  }

  async setItem<T>(key: string, index: number | string, value: T): Promise<void> {
    await this.set(`${key}:${index}`, value)

    const items = await this.get<string[]>(`${key}:${INDEX_SUFFIX}`) || []
    const strIndex = String(index)
    if (!items.includes(strIndex)) {
      items.push(strIndex)
      await this.set(`${key}:${INDEX_SUFFIX}`, items)
    }
  }

  async getItem<T>(key: string, index: number | string): Promise<T | undefined> {
    return this.get<T>(`${key}:${index}`)
  }

  async getListSize(key: string): Promise<number> {
    const items = await this.get<string[]>(`${key}:${INDEX_SUFFIX}`)
    return items?.length || 0
  }

}
