import Dexie, { EntityTable } from 'dexie'
import { StoreAdapter } from '../../store/storeAdapter'
import { logger } from '../../utils/log'
import { CacheDbModel } from './cache.ts'
import { ContactDbModel } from './contact'
import { MessageDbModel } from './message'
import { SessionDbModel } from './session.ts'
import { SubscriberDbModel } from './subscriber.ts'
import { TopicDbModel } from './topic.ts'

// Configure Dexie to avoid eval usage
Dexie.debug = false

export class Db {
  static NKN_DATABASE_NAME = 'nkn'
  static currentDatabaseVersion = 4
  static db: Record<string, Dexie> = {}
  static lastOpenedId: string | null = null

  static async openDb(publicKey: string, seed: string) {
    const dbName = `${this.NKN_DATABASE_NAME}_${publicKey}`
    logger.debug(`open db: ${dbName}`)
    const db = new Dexie(dbName) as Dexie & {
      messages: EntityTable<MessageDbModel, 'id'>
      sessions: EntityTable<SessionDbModel, 'id'>
      contacts: EntityTable<ContactDbModel, 'id'>
      topics: EntityTable<TopicDbModel, 'id'>
      subscribers: EntityTable<SubscriberDbModel, 'id'>
      caches: EntityTable<CacheDbModel, 'id'>
    }
    this.db[publicKey] = db

    db.version(4).stores({
      messages:
        '++id, &message_id, payload_id, sent_at, received_at, [payload_id+is_delete], [payload_id+payload_type], [is_outbound+is_delete], [target_id+target_type], [target_id+target_type+is_delete+sent_at], [target_id+target_type+is_outbound+is_delete], [payload_id+status]',
      sessions:
        '++id, target_id, target_type, last_message_outbound, last_message_at, un_read_count, is_top, &[target_id+target_type], [is_top+last_message_at]',
      topics: '++id, &topic, created_at, updated_at, joined, subscribe_at, expire_height, avatar, count',
      subscribers: '++id, topic, created_at, updated_at, contact_address, status, &[topic+contact_address]',
      contacts: '++id, &address, created_at, updated_at, first_name, last_name, [type+created_at], [type+updated_at]',
      caches: '++id, name, type, createdAt, lastAccessed, expiresAt'
    })

    this.lastOpenedId = publicKey
    StoreAdapter.db = Db

    // Wait for database to be ready
    await db.open()
  }

  // static async onCreate(db: Dexie, version: number) {}

  // static async onUpgrade(db: Dexie, oldVersion: number, newVersion: number) {}

  static close(id: string) {
    this.db[id].close()
    delete this.db[id]
    if (this.lastOpenedId === id) {
      this.lastOpenedId = null
    }
  }

  static getDb(id: string) {
    if (this.db[id]) {
      return this.db[id]
    }
    throw new Error(`Database ${id} not found`)
  }

  static getLastOpenedDb() {
    if (this.lastOpenedId) {
      return this.db[this.lastOpenedId]
    }
  }
}
