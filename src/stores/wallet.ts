import { WalletHelper, WalletRecord } from '@d-chat/core'
import { WalletJson } from 'nkn-sdk'
import { defineStore } from 'pinia'

const STORE_NAME = 'wallet'
const walletHelper = new WalletHelper()

export const useWalletStore = defineStore(STORE_NAME, {
  state: (): { default: WalletRecord | null; wallets: WalletRecord[] } => {
    return {
      default: null,
      wallets: []
    }
  },
  actions: {
    async getAll() {
      this.wallets = await walletHelper.getAllWallets()
      return this.wallets
    },
    async setDefault(addr: string) {
      return await walletHelper.setDefaultWallet(addr)
    },
    async getDefault() {
      this.default = await walletHelper.getDefaultWallet()
      return this.default
    },
    async addWallet(walletRecord: WalletRecord) {
      await walletHelper.addWallet(walletRecord)
      await this.getAll()
    },
    async deleteWallet(walletRecord: WalletRecord) {
      await walletHelper.deleteWallet(walletRecord)
      await this.getAll()
    },
    async savePassword(password: string) {
      return await walletHelper.savePassword(password)
    },
    async getPassword() {
      return await walletHelper.getPassword()
    },
    async creatNknWallet(options: { password?: string; seed?: string }): Promise<WalletRecord> {
      const wallet = await walletHelper.createNknWallet(options)
      if ('seed' in wallet) {
        delete wallet.seed
      }
      await this.addWallet(wallet)
      return wallet
    },
    async restoreNknWallet(keystore: WalletJson | string, password: string): Promise<WalletRecord> {
      return await walletHelper.restoreNknWallet(keystore, password)
    }
  }
})
