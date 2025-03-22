<template>
  <v-container>
    <CreateNknWallet/>

  </v-container>
</template>


<script lang="ts" setup>
import {useWalletStore} from '../../stores/wallet'
import CreateNknWallet from './CreateNknWallet.vue'
import {ComponentPublicInstance, getCurrentInstance, reactive} from 'vue'


const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const walletStore = useWalletStore()
const state = reactive({
  wallets: null,
})


</script>
