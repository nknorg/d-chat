<template>
  <SessionList />
</template>


<script lang="ts" setup>
import SessionList from "@/views/chat/SessionList.vue";
import { useClientStore } from "../../stores/client";
// import { useCommonStore } from '../../stores/common'
// import {useWalletStore} from '../../stores/wallet'
import NoConnect from "./NoConnect.vue";
// import SessionList from './SessionList.vue'
//
// import {ComponentPublicInstance, getCurrentInstance, onBeforeMount, reactive} from 'vue'
//
// const ins = getCurrentInstance()
// const proxy: ComponentPublicInstance = ins!.proxy!
// const walletStore = useWalletStore()
const clientStore = useClientStore();
// const commonStore = useCommonStore()
//
// const state = reactive({
//   wallets: [],
//
// })
//


</script>
