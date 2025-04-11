import Dexie, { EntityTable } from 'dexie'
import { StoreAdapter } from '../../store/storeAdapter'
import { logger } from '../../utils/log'
import { ContactDbModel } from './contact'
import { MessageDbModel } from './message'

export class Db {
  static NKN_DATABASE_NAME = 'nkn'
  static currentDatabaseVersion = 4
  static db: Record<string, Dexie> = {}
  static lastOpenedId: string | null = null

  static openDb(publicKey: string, seed: string) {
    const dbName = `${this.NKN_DATABASE_NAME}_${publicKey}`
    logger.debug(`open db: ${dbName}`)
    const db = new Dexie(dbName) as Dexie & {
      messages: EntityTable<MessageDbModel, 'id'>
      contacts: EntityTable<ContactDbModel, 'id'>
    }
    this.db[publicKey] = db
    const oldVersion = db.verno
    if (oldVersion !== this.currentDatabaseVersion) {
      this.onCreate(db, this.currentDatabaseVersion)
      this.onUpgrade(db, oldVersion, this.currentDatabaseVersion)
    }
    this.lastOpenedId = publicKey
    StoreAdapter.db = Db
  }

  static async onCreate(db: Dexie, version: number) {
    db.version(version).stores({
      messages:
        '++id, message_id, payload_id, msg_id, created_at, updated_at, [target_id+target_type+is_delete+sent_at]',
      sessions:
        '++id, target_id, target_type, last_message_outbound, last_message_at, un_read_count, is_top, &[target_id+target_type], [is_top+last_message_at]',
      contacts:
        '++id, address, created_at, updated_at, first_name, last_name, [type+created_at], [type+updated_at]'
    })
  }

  static async onUpgrade(db: Dexie, oldVersion: number, newVersion: number) {

  }

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
