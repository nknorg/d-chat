<template>
  <v-app-bar
    color="primary"
    density="compact"
  >
    <v-app-bar-title>{{ $t('my_wallets') }}</v-app-bar-title>

    <template v-slot:append>
      <v-btn icon="mdi-import" to="/wallet/importNknWallet"></v-btn>
      <v-btn icon="mdi-plus" to="/wallet/createNknWallet"></v-btn>
    </template>
  </v-app-bar>
  <v-container>
    <v-list lines="three">
      <v-list-item
        v-for="(w,i) in walletStore.wallets"
        :key="i"
        :title="w['name']"
        :subtitle="w.address!"
      >
        <template v-slot:prepend>
          <v-avatar color="primary" size="48" class="justify-center align-center">
            <svg-icon name="logo" :size="28"/>
          </v-avatar>
        </template>

      </v-list-item>
    </v-list>

  </v-container>
</template>

<script lang="ts" setup>
import {useWalletStore} from '../../stores/wallet'
import {ComponentPublicInstance, getCurrentInstance, onBeforeMount} from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const walletStore = useWalletStore()

onBeforeMount(async () => {
  await walletStore.getAll()
})

</script>

