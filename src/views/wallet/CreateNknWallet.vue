<template>
  <v-form fast-fail @submit.prevent="submit">
    <v-text-field clearable
                  v-model="state.name"
                  :label="$t('wallet_name')"
                  :rules="[validator.required()]"
    ></v-text-field>

    <v-text-field
      v-model="state.password"
      type="password"
      :label="$t('input_password')"
      :rules="[validator.required()]"
    ></v-text-field>

    <v-text-field
      v-model="state.confirmPassword"
      type="password"
      :label="$t('confirm_password')"
      :rules="[validator.required(), validator.confirmPassword(state.password)]"
    ></v-text-field>

    <v-btn type="submit" block class="mt-2">{{ $t('create_wallet') }}</v-btn>
  </v-form>
</template>

<script lang="ts" setup>
import {Validator} from '../../helpers/validator'
import {useWalletStore} from '../../stores/wallet'
import {ComponentPublicInstance, getCurrentInstance, reactive} from 'vue'

const validator = new Validator()
const walletStore = useWalletStore()
const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const state = reactive({
  name: '',
  password: '',
  confirmPassword: '',
})

async function submit(event: any) {
  const results = await event
  if (results.valid) {
    let wallet = await walletStore.creatNknWallet({password: state.password})
    await walletStore.addWallet(wallet.address, {
      name: state.name,
      publicKey: wallet.publicKey,
      keystore: wallet.keystore,
      balance: 0,
    })
    proxy.$router.back()
  }
}
</script>
