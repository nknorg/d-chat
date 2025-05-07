import { WalletHelper, WalletRecord } from '@d-chat/core'
import { WalletJson } from 'nkn-sdk'
import { defineStore } from 'pinia'

const STORE_NAME = 'wallet'

export const useWalletStore = defineStore(STORE_NAME, {
  state: (): { default: WalletRecord | null; wallets: WalletRecord[] } => {
    return {
      default: null,
      wallets: []
    }
  },
  actions: {
    async getAll() {
      const walletHelper = new WalletHelper()
      this.wallets = await walletHelper.getAllWallets()
      return this.wallets
    },
    async setDefault(addr: string) {
      const walletHelper = new WalletHelper()
      return await walletHelper.setDefaultWallet(addr)
    },
    async getDefault() {
      const walletHelper = new WalletHelper()
      this.default = await walletHelper.getDefaultWallet()
      return this.default
    },
    async addWallet(walletRecord: WalletRecord) {
      const walletHelper = new WalletHelper()
      await walletHelper.addWallet(walletRecord)
      await this.getAll()
    },
    async deleteWallet(walletRecord: WalletRecord) {
      const walletHelper = new WalletHelper()
      await walletHelper.deleteWallet(walletRecord)
      await this.getAll()
    },
    async savePassword(password: string) {
      const walletHelper = new WalletHelper()
      return await walletHelper.savePassword(password)
    },
    async getPassword() {
      const walletHelper = new WalletHelper()
      return await walletHelper.getPassword()
    },
    async removePassword() {
      const walletHelper = new WalletHelper()
      return await walletHelper.removePassword()
    },
    async creatNknWallet(options: { password?: string; seed?: string }): Promise<WalletRecord> {
      const walletHelper = new WalletHelper()
      const wallet = await walletHelper.createNknWallet(options)
      if ('seed' in wallet) {
        delete wallet.seed
      }
      await this.addWallet(wallet)
      return wallet
    },
    async restoreNknWallet(keystore: WalletJson | string, password: string): Promise<WalletRecord> {
      const walletHelper = new WalletHelper()
      return await walletHelper.restoreNknWallet(keystore, password)
    }
  }
})
