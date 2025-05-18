<template>
  <v-navigation-drawer theme="dark" rail permanent>
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-chat-plus" @click="null">
        <v-tooltip activator="parent">{{ $t('new_whisper') }}</v-tooltip>
        <NewWhisperDialog />
      </v-list-item>
      <v-list-item prepend-icon="mdi-forum-plus" @click="null">
        <v-tooltip activator="parent">{{ $t('create_channel') }}</v-tooltip>
        <NewPublicGroupDialog />
      </v-list-item>
      <!--      <v-list-item prepend-icon="mdi-view-dashboard" value="dashboard"></v-list-item>-->
      <v-list-item class="align-self-auto" @click="null">
        <v-icon icon="mdi-power" color="red" />
        <v-tooltip activator="parent">{{ $t('sign_out') }}</v-tooltip>
        <v-menu activator="parent" transition="fade-transition">
          <v-list density="compact" min-width="250" rounded="lg" slim>
            <v-list-item @click="signOut">{{ $t('sign_out_confirm') }}</v-list-item>
          </v-list>
        </v-menu>
      </v-list-item>
    </v-list>

    <v-divider class="my-1" />

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-refresh" @click="refresh">
        <v-tooltip activator="parent">{{ $t('refresh') }}</v-tooltip>
      </v-list-item>
      <v-list-item v-if="isExtension" prepend-icon="mdi-tab" @click="newTab">
        <v-tooltip activator="parent">{{ $t('new_tab') }}</v-tooltip>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script setup lang="ts">
import { useClientStore } from '@/stores/client'
import { useWalletStore } from '@/stores/wallet'
import { ComponentPublicInstance, getCurrentInstance, ref } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const isExtension = typeof chrome !== 'undefined' && chrome.tabs !== undefined

const clientStore = useClientStore()
const walletStore = useWalletStore()

async function signOut() {
  await clientStore.disconnect()
  await walletStore.removePassword()
  proxy.$router.push('/')
}

function refresh() {
  window.location.reload()
}

function newTab() {
  // Open a new tab in Chrome extension
  if (isExtension) {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL('index.html'),
        active: true
      },
      (tab) => {
        console.log('New tab created with id:', tab.id)
      }
    )
  }
}
</script>
<style>
.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}
</style>
