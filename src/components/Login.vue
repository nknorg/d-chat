<template>
  <v-card class="mx-auto pa-8 pt-4 pb-2 mb-8" max-width="600" elevation="8" rounded="lg">
    <SelectAccount :selected-account="state.selectedAccount" :on-select-account="selectAccount" />

    <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
      {{ $t('wallet_password') }}
    </div>

    <v-text-field
      v-model="state.password"
      :type="'password'"
      :placeholder="$t('input_password')"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
      hide-details
    ></v-text-field>

    <v-checkbox
      v-model="state.savePassword"
      density="compact"
      :label="$t('auto_sign_in')"
    ></v-checkbox>

    <v-card class="mb-8" color="surface-variant" variant="tonal">
      <v-card-text class="text-medium-emphasis text-caption">
        {{ $t('login_warning') }}
      </v-card-text>
    </v-card>

    <v-btn
      :loading="state.signInLoading"
      class="mb-4"
      color="blue"
      size="large"
      variant="tonal"
      block
      @click="signIn"
    >
      {{ $t('login') }}
    </v-btn>

    <Footer />
  </v-card>
</template>
<script setup lang="ts">
import SelectAccount from '@/components/wallet/SelectAccount.vue'
import { useClientStore } from '@/stores/client'
import { useWalletStore } from '@/stores/wallet'
import { WalletRecord, logger } from '@d-chat/core'
import { push } from 'notivue'
import { onBeforeMount, reactive } from 'vue'
import { errors } from 'nkn-sdk'
import { ComponentPublicInstance, getCurrentInstance } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const walletStore = useWalletStore()
const clientStore = useClientStore()
const state = reactive<{
  signInLoading: boolean
  password: string
  savePassword: boolean
  selectedAccount: WalletRecord | null
}>({
  signInLoading: false,
  password: '',
  savePassword: false,
  selectedAccount: null
})

onBeforeMount(async () => {
  const wallet = await walletStore.getDefault()
  state.selectedAccount = wallet
})

async function selectAccount(wallet: WalletRecord): Promise<void> {
  state.selectedAccount = wallet
}

async function signIn() {
  state.signInLoading = true
  let wallet = state.selectedAccount
  if (wallet == null) {
    wallet = await walletStore.creatNknWallet({ password: state.password })
  }
  const password = state.password
  try {
    const { seed } = await walletStore.restoreNknWallet(wallet.keystore, password)

    if (!seed) {
      push.error(proxy.$t('password_wrong'))
      return
    }

    if (state.savePassword) {
      await walletStore.savePassword(state.password)
    }

    await walletStore.setDefault(wallet.address)

    await clientStore.connect(seed)
    proxy.$router.push('/chat')
  } catch (error) {
    if (error instanceof errors.WrongPasswordError) {
      push.error(proxy.$t('password_wrong'))
    }
    logger.error(error)
  }
  state.signInLoading = false
}
</script>
