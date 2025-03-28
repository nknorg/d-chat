<template>
  <v-dialog v-model="state.dialog" persistent width="600">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn variant="tonal" v-bind="activatorProps">{{ $t('import_with_seed_title') }}</v-btn>
    </template>
    <v-form fast-fail @submit.prevent="submit">
      <v-card class="pt-2">
        <v-card-title>
          <span class="text-h5">{{ $t('import_with_seed_title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-text-field
              class="mb-3"
              v-model="state.seed"
              :label="$t('seed')"
              :placeholder="$t('input_seed')"
              variant="outlined"
              :rules="[validator.required(), validator.isNknSeed()]"
              autofocus
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="state.password"
              :label="$t('wallet_password')"
              :type="'password'"
              :placeholder="$t('input_password')"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              hide-details
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
import { useWalletStore } from '@/stores/wallet'
import { ComponentPublicInstance, getCurrentInstance, onBeforeMount, reactive } from 'vue'

const validator = new Validator()
const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const walletStore = useWalletStore()

const state = reactive<{
  dialog: boolean
  seed: string
  password: string
}>({
  dialog: false,
  seed: '',
  password: ''
})

onBeforeMount(async () => {})

async function submit(event: any) {
  const results = await event
  if (!results.valid) {
    return
  }

  await walletStore.creatNknWallet({ seed: state.seed, password: state.password })
  state.dialog = false
  state.seed = ''
}
</script>
