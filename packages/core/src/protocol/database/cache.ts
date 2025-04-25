import Dexie from 'dexie'

export enum MediaType {
  IMAGE = 'image',
  FILE = 'file',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export interface CacheDbModel {
  id: string
  type: MediaType
  mimeType: string
  name: string
  size: number
  width?: number
  height?: number
  duration?: number
  thumbnail?: Blob
  createdAt: number
  lastAccessed: number
  expiresAt?: number
  tags?: string[]
  source: Blob
}

export interface ICacheDb {
  get(id: string): Promise<CacheDbModel | undefined>

  add(item: Omit<CacheDbModel, 'id'>): Promise<string>

  update(id: string, changes: Partial<CacheDbModel>): Promise<void>

  delete(id: string): Promise<void>

  list(limit?: number, offset?: number): Promise<CacheDbModel[]>

  findByType(type: MediaType): Promise<CacheDbModel[]>

  findByTags(tags: string[]): Promise<CacheDbModel[]>

  clear(): Promise<void>

  clearExpired(): Promise<void>

  updateLastAccessed(id: string): Promise<void>

  count(): Promise<number>

  getSize(): Promise<number>
}

export class CacheDb implements ICacheDb {
  static tableName = 'caches'
  private db: Dexie

  constructor(db: Dexie) {
    this.db = db
  }

  async get(id: string): Promise<CacheDbModel | undefined> {
    return await this.db.table(CacheDb.tableName).get(id)
  }

  async add(item: Omit<CacheDbModel, 'id'>): Promise<string> {
    const id = crypto.randomUUID()
    await this.db.table(CacheDb.tableName).add({ ...item, id })
    return id
  }

  async update(id: string, changes: Partial<CacheDbModel>): Promise<void> {
    await this.db.table(CacheDb.tableName).update(id, changes)
  }

  async delete(id: string): Promise<void> {
    await this.db.table(CacheDb.tableName).delete(id)
  }

  async list(limit?: number, offset?: number): Promise<CacheDbModel[]> {
    return await this.db
      .table(CacheDb.tableName)
      .offset(offset || 0)
      .limit(limit || Infinity)
      .toArray()
  }

  async findByType(type: MediaType): Promise<CacheDbModel[]> {
    return await this.db.table(CacheDb.tableName).where('type').equals(type).toArray()
  }

  async findByTags(tags: string[]): Promise<CacheDbModel[]> {
    return await this.db
      .table(CacheDb.tableName)
      .filter((item) => tags.every((tag) => item.tags?.includes(tag)))
      .toArray()
  }

  async clear(): Promise<void> {
    await this.db.table(CacheDb.tableName).clear()
  }

  async clearExpired(): Promise<void> {
    const now = Date.now()
    await this.db.table(CacheDb.tableName).where('expiresAt').below(now).delete()
  }

  async updateLastAccessed(id: string): Promise<void> {
    await this.db.table(CacheDb.tableName).update(id, { lastAccessed: Date.now() })
  }

  async count(): Promise<number> {
    return await this.db.table(CacheDb.tableName).count()
  }

  async getSize(): Promise<number> {
    const items = await this.db.table(CacheDb.tableName).toArray()
    return items.reduce((total, item) => total + item.size, 0)
  }
}