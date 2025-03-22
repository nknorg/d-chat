<template>
  <v-form fast-fail @submit.prevent="submit">
    <v-textarea clearable
                v-model="state.keystore"
                :label="$t('keystore')"
                :rules="[validator.required()]"
                :error="state.keystoreError"
                :error-messages="state.keystoreErrorMessage"
    ></v-textarea>
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
      :error="state.passwordError"
      :error-messages="state.passwordErrorMessage"
    ></v-text-field>

    <v-btn type="submit" block class="mt-2">{{ $t('import_wallet') }}</v-btn>
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
  keystore: '',
  keystoreError: false,
  keystoreErrorMessage: '',
  name: '',
  password: '',
  passwordError: false,
  passwordErrorMessage: '',
})

async function submit(event: any) {
  const results = await event
  if (results.valid) {
    try {
      let wallet = await walletStore.restoreNknWallet(state.keystore, state.password)
      await walletStore.addWallet(wallet.address, {
        name: state.name,
        publicKey: wallet.publicKey,
        keystore: wallet.keystore,
        balance: 0,
      })
      proxy.$router.back()
    } catch (e: any) {
      if(e.message.includes('wrong password')){
        state.passwordError = true
        state.passwordErrorMessage = proxy.$t('tip_password_error')
      } else {
        state.keystoreError = true
        state.keystoreErrorMessage = proxy.$t('error_keystore_format')
      }
    }
  }
}
</script>
