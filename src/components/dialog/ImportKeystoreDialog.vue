<template>
  <v-dialog v-model="state.dialog" persistent width="600">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn variant="tonal" v-bind="activatorProps">{{ $t('import_with_keystore_title') }}</v-btn>
    </template>
    <v-form fast-fail @submit.prevent="submit">
      <v-card class="pt-2">
        <v-card-title>
          <span class="text-h5">{{ $t('import_with_keystore_title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-file-input
              class="mb-3"
              v-model="state.keystore"
              :label="$t('keystore')"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              variant="outlined"
              :rules="[validator.required()]"
              counter
              show-size
            ></v-file-input>
          </v-row>
          <v-row>
            <v-text-field
              v-model="state.password"
              :label="$t('wallet_password')"
              :type="'password'"
              :placeholder="$t('input_password')"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              :error="state.passwordError"
              :error-messages="state.passwordErrorMessage"
            ></v-text-field>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="state.dialog = false">
            {{ $t('cancel') }}
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" type="submit">
            {{ $t('ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { Validator } from '@/common/validator'
import { File } from '@/common/file'
import { useWalletStore } from '@/stores/wallet'
import { getDefaultName, logger } from "@d-chat/core";
import { push } from 'notivue'
import { ComponentPublicInstance, getCurrentInstance, onBeforeMount, reactive } from 'vue'
import { errors } from 'nkn-sdk'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const validator = new Validator()
const walletStore = useWalletStore()

const state = reactive<{
  dialog: boolean
  keystore: File | null
  password: string
  passwordError: boolean
  passwordErrorMessage: string
}>({
  dialog: false,
  keystore: null,
  password: '',
  passwordError: false,
  passwordErrorMessage: ''
})

onBeforeMount(async () => {})

async function submit(event: any) {
  const results = await event
  if (!results.valid) {
    return
  }
  const keystore = await File.read(state.keystore)

  try {
    const wallet = await walletStore.restoreNknWallet(keystore, state.password)
    await walletStore.addWallet({
      address: wallet.address,
      name: wallet.name,
      publicKey: wallet.publicKey,
      keystore: wallet.keystore,
      balance: 0
    })
  } catch (error) {
    if (error instanceof errors.WrongPasswordError) {
      state.passwordErrorMessage = proxy.$t('password_wrong')
    }
    state.passwordError = true
    return
  }

  state.dialog = false
  state.keystore = null
}
</script>
