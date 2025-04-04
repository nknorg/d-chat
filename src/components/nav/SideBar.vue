<template>
  <v-navigation-drawer theme="dark" rail permanent>
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-chat-plus" value="newWhisper">
        <NewWhisperDialog />
      </v-list-item>
      <v-list-item prepend-icon="mdi-forum-plus"></v-list-item>
<!--      <v-list-item prepend-icon="mdi-view-dashboard" value="dashboard"></v-list-item>-->
      <v-list-item class="align-self-auto">
        <v-icon icon="mdi-power" color="red" />
        <v-tooltip activator="parent">{{ $t('sign_out') }}</v-tooltip>
        <v-menu activator="parent" transition="fade-transition">
          <v-list density="compact" min-width="250" rounded="lg" slim>
            <v-list-item @click="signOut">{{ $t('sign_out_confirm') }}</v-list-item>
          </v-list>
        </v-menu>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script setup lang="ts">
import { useClientStore } from '@/stores/client'
import { useWalletStore } from '@/stores/wallet'
import { ComponentPublicInstance, getCurrentInstance } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const clientStore = useClientStore()
const walletStore = useWalletStore()

async function signOut() {
  await clientStore.disconnect()
  await walletStore.removePassword()
  proxy.$router.push('/')
}
</script>
