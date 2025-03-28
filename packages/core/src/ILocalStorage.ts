export interface ILocalStorage {
  set<T>(key: string, value: T): Promise<void>

  get<T>(key: string): Promise<T | undefined>

  remove(key: string): Promise<void>

  clear(): Promise<void>

  setList<T>(key: string, data: T[] | Record<string, T>): Promise<void>

  getList<T>(key: string): Promise<T[] | Record<string, T> | undefined>

  removeList(key: string): Promise<void>

  setItem<T>(key: string, index: number | string, value: T): Promise<void>

  getItem<T>(key: string, index: number | string): Promise<T | undefined>

  getListSize(key: string): Promise<number>
}
