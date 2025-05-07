<template>
  <v-alert :theme="theme.global.name.value" max-width="400" type="warning" border="start" close-label="Close Alert" variant="elevated" closable>
    <template #title>
      {{ props.item.title }}
    </template>
    <p>
      {{ props.item.message }}
    </p>
    <v-divider class="my-2" />
    <v-btn variant="text" color="primary" @click="openPermissionsPage">
      <template #append>
        <v-icon icon="mdi-open-in-new"></v-icon>
      </template>
      {{ $t('open_extension_permissions') }}
    </v-btn>
  </v-alert>
</template>

<script setup lang="ts">
import { NotivueItem } from 'notivue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const props = defineProps<{
  item: NotivueItem
}>()

// Open Chrome's site permissions page
const openPermissionsPage = () => {
  const extensionId = chrome.runtime.id
  chrome.tabs.create({
    url: `chrome://settings/content/siteDetails?site=chrome-extension://${extensionId}`
  })
}
</script>
