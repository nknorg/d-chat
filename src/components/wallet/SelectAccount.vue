<template>
  <v-menu>
    <template #activator="{ props }">
      <v-card v-if="!!mprops.selectedAccount" elevation="0" v-bind="props" class="mx-auto" :title="mprops.selectedAccount?.name" :subtitle="$t('click_to_switch_account')">
        <template #prepend>
          <v-avatar size="60">
            <Icon icon="material-symbols:account-balance-wallet-outline" width="60" height="60" />
          </v-avatar>
        </template>
      </v-card>
      <v-card v-else elevation="0" v-bind="props" class="mx-auto" :title="$t('new_account')" :subtitle="$t('click_to_switch_account')">
        <template #prepend>
          <v-avatar size="60">
            <Icon icon="material-symbols:account-balance-wallet-outline" width="60" height="60" />
          </v-avatar>
        </template>
      </v-card>
    </template>

    <v-card min-width="300">
      <v-list lines="two">
        <v-list-item v-for="wallet in walletStore.wallets" :key="wallet.address" @click="onSelectAccount(wallet)">
          <template #prepend>
            <v-avatar size="40">
              <Icon icon="material-symbols:account-balance-wallet-outline" width="40" height="40" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ wallet.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ formatAddress(wallet.publicKey) }}</v-list-item-subtitle>
          <template #append>
            <v-btn icon size="24" color="error" @click.stop="deleteAccount(wallet)">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
        <v-list-item @click="onSelectAccount(null)">
          <template #prepend>
            <v-avatar size="40">
              <Icon icon="material-symbols:account-balance-wallet-outline" width="40" height="40" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ $t('new_account') }}</v-list-item-title>
          <v-list-item-subtitle>......</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-card-actions>
        <v-spacer />
        <ImportKeystoreDialog />
        <ImportSeedDialog />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script setup lang="ts">
import ImportKeystoreDialog from '@/components/dialog/ImportKeystoreDialog.vue'
import { useDialogStore } from '@/stores/dialog'
import { formatAddress, WalletRecord } from '@d-chat/core'
import { useWalletStore } from '@/stores/wallet'
import { Icon } from '@iconify/vue'
import { ComponentPublicInstance, defineProps, getCurrentInstance } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const walletStore = useWalletStore()
const dialogStore = useDialogStore()
const mprops = defineProps<{
  selectedAccount: WalletRecord | null
  onSelectAccount: (account: WalletRecord | null) => void
}>()

async function deleteAccount(wallet: WalletRecord | null): Promise<void> {
  if (wallet == null) {
    return
  }
  const result = await dialogStore.showConfirm({
    title: proxy.$t('delete_wallet_confirm_title'),
    content: proxy.$t('delete_wallet_confirm_text'),
    type: 'error'
  })
  if (result) {
    await walletStore.deleteWallet(wallet)
  }
}
</script>
