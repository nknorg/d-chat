import { ILocalStorage } from '@d-chat/core'

const INDEX_SUFFIX = '_index'

export class ChromeStorage implements ILocalStorage {
  private storageType: 'sync' | 'local'

  constructor(storageType: 'sync' | 'local' = 'sync') {
    this.storageType = storageType
  }

  async get<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(result[key])
        }
      })
    })
  }

  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  async setList<T>(key: string, data: T[] | Record<string, T>): Promise<void> {
    const isArray = Array.isArray(data)
    const keys: string[] = []

    const tasks: Promise<void>[] = []

    if (isArray) {
      for (let i = 0; i < data.length; i++) {
        const itemKey = `${key}:${i}`
        keys.push(`${i}`)
        tasks.push(this.set(itemKey, data[i]))
      }
    } else {
      for (const k in data) {
        const itemKey = `${key}:${k}`
        keys.push(k)
        tasks.push(this.set(itemKey, data[k]))
      }
    }

    tasks.push(this.set(`${key}:${INDEX_SUFFIX}`, keys))
    await Promise.all(tasks)
  }

  async getList<T>(key: string): Promise<T[] | Record<string, T> | undefined> {
    const keys = await this.get<string[]>(`${key}:${INDEX_SUFFIX}`)
    if (!keys) return undefined

    const result: any = keys.every(k => /^\d+$/.test(k)) ? [] : {}
    const tasks = keys.map(async subKey => {
      const item = await this.get<T>(`${key}:${subKey}`)
      if (Array.isArray(result)) {
        result.push(item)
      } else {
        result[subKey] = item
      }
    })

    await Promise.all(tasks)
    return result
  }

  async removeList(key: string): Promise<void> {
    const keys = await this.get<string[]>(`${key}:${INDEX_SUFFIX}`)
    if (keys) {
      const tasks = keys.map(subKey => this.remove(`${key}:${subKey}`))
      tasks.push(this.remove(`${key}:${INDEX_SUFFIX}`))
      await Promise.all(tasks)
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
