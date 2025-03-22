import { ILocalStorage } from '@d-chat/core'

export class LocalStorage implements ILocalStorage {
  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async get(key: string): Promise<any> {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}
