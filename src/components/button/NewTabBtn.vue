<template>
  <v-btn v-if="isExtension" icon="mdi-tab" @click="newTab"></v-btn>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isExtension = ref(false)

onMounted(() => {
  // Check if we're in a browser extension environment
  isExtension.value = typeof chrome !== 'undefined' && chrome.tabs !== undefined
})

function newTab() {
  // Open a new tab in Chrome extension
  if (isExtension.value) {
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
