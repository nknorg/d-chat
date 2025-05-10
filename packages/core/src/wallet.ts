import { Wallet, WalletJson } from 'nkn-sdk'
import { ILocalStorage } from './ILocalStorage'
import { StoreAdapter } from './store/storeAdapter'
import { getDefaultName } from './utils/format'

export interface WalletRecord {
  address: string
  name: string
  keystore: WalletJson
  publicKey: string
  balance: number
  seed?: string
}

const WALLET_KEY = 'wallets'

export class WalletHelper {
  private storage: ILocalStorage = StoreAdapter.localStorage

  constructor(storage?: ILocalStorage) {
    if (storage) {
      this.storage = storage
    }
  }

  async setDefaultWallet(address: string) {
    return await this.storage.set(`${WALLET_KEY}:default`, address)
  }

  async getDefaultWallet(): Promise<WalletRecord | null> {
    const addr: string = await this.storage.get(`${WALLET_KEY}:default`)
    if (!addr) {
      return null
    }
    return await this.getWalletByAddress(addr)
  }

  async savePassword(password: string): Promise<void> {
    await this.storage.set(`${WALLET_KEY}:password`, password)
  }

  async getPassword(): Promise<string | undefined> {
    return await this.storage.get(`${WALLET_KEY}:password`)
  }

  async removePassword(): Promise<void> {
    await this.storage.remove(`${WALLET_KEY}:password`)
  }

  async addWallet(wallet: WalletRecord) {
    const wallets: WalletRecord[] = ((await this.storage.getList(WALLET_KEY)) as WalletRecord[]) || []
    wallets.push(wallet)
    return await this.storage.setList(WALLET_KEY, wallets)
  }

  async deleteWallet(wallet: WalletRecord) {
    const wallets: WalletRecord[] = ((await this.storage.getList(WALLET_KEY)) as WalletRecord[]) || []
    const index = wallets.findIndex((w) => w.address === wallet.address)
    if (index >= 0) {
      wallets.splice(index, 1)
      await this.storage.removeList(WALLET_KEY)
      return await this.storage.setList(WALLET_KEY, wallets)
    }
  }

  async getWalletByAddress(addr: string): Promise<WalletRecord> {
    const wallets: WalletRecord[] = await this.getAllWallets()
    return wallets.find((wallet) => wallet.address === addr) as WalletRecord
  }

  async getAllWallets(): Promise<WalletRecord[]> {
    const wallets = (await this.storage.getList(WALLET_KEY)) as WalletRecord[]
    return wallets
  }

  async createNknWallet(options?: { password?: string; seed?: string }): Promise<WalletRecord> {
    const wallet = new Wallet({ password: options.password, seed: options.seed })
    return {
      name: getDefaultName(wallet.getPublicKey()),
      address: wallet.address,
      publicKey: wallet.getPublicKey(),
      seed: wallet.getSeed(),
      keystore: wallet.toJSON(),
      balance: 0
    }
  }

  async restoreNknWallet(keystore: WalletJson | string, password: string): Promise<WalletRecord> {
    const wallet = Wallet.fromJSON(keystore, { password }) as Wallet
    return {
      name: getDefaultName(wallet.getPublicKey()),
      address: wallet.address,
      publicKey: wallet.getPublicKey(),
      seed: wallet.getSeed(),
      keystore: wallet.toJSON(),
      balance: 0
    }
  }
}
