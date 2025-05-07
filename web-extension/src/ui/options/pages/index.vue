<template>
  <v-app theme="dark">
    <v-main>
      <v-container>
        <v-card class="mx-auto" max-width="600">
          <v-card-title class="text-h5">
            <v-layout>
              {{ $t('options') }}
              <v-spacer />
              <v-btn variant="text" color="primary" @click="openPermissionsPage">
                <template #append>
                  <v-icon icon="mdi-open-in-new"></v-icon>
                </template>
                {{ $t('open_extension_permissions') }}
              </v-btn>
            </v-layout>
          </v-card-title>

          <v-card-text>
            <v-btn block class="mb-4" :color="micPermission ? 'success' : 'primary'" :disabled="micPermission" @click="handleMicPermissionChange(true)">
              <v-icon :icon="micPermission ? 'mdi-microphone' : 'mdi-microphone-off'" class="mr-2"></v-icon>
              {{ micPermission ? 'Microphone Enabled' : 'Enable Microphone' }}
            </v-btn>

            <v-btn block :color="notificationPermission ? 'success' : 'primary'" :disabled="notificationPermission" @click="handleNotificationPermissionChange(true)">
              <v-icon :icon="notificationPermission ? 'mdi-bell' : 'mdi-bell-off'" class="mr-2"></v-icon>
              {{ notificationPermission ? 'Notifications Enabled' : 'Enable Notifications' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const micPermission = ref(false)
const notificationPermission = ref(false)

// Check current permission status
onMounted(async () => {
  // Check microphone permission
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as any })
    micPermission.value = result.state === 'granted'
  } catch (error) {
    console.error('Error checking microphone permission:', error)
  }

  // Check notification permission
  try {
    const result = await navigator.permissions.query({ name: 'notifications' as any })
    notificationPermission.value = result.state === 'granted'
  } catch (error) {
    console.error('Error checking notification permission:', error)
  }
})

// Handle microphone permission change
const handleMicPermissionChange = async (value: boolean) => {
  try {
    if (value) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      // Update permission state after successful grant
      const result = await navigator.permissions.query({ name: 'microphone' as any })
      micPermission.value = result.state === 'granted'
    } else {
      // Notify user to manually disable permission in browser settings
      alert('Please disable microphone permission in your browser settings')
    }
  } catch (error) {
    console.error('Error handling microphone permission:', error)
    micPermission.value = false
  }
}

// Handle notification permission change
const handleNotificationPermissionChange = async (value: boolean) => {
  try {
    if (value) {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission === 'granted'
      if (!notificationPermission.value) {
        alert('Notification permission was not granted')
      }
    } else {
      // Notify user to manually disable permission in browser settings
      alert('Please disable notification permission in your browser settings')
    }
  } catch (error) {
    console.error('Error handling notification permission:', error)
    notificationPermission.value = false
  }
}

// Open Chrome's site permissions page
const openPermissionsPage = () => {
  const extensionId = chrome.runtime.id
  chrome.tabs.create({
    url: `chrome://settings/content/siteDetails?site=chrome-extension://${extensionId}`
  })
}
</script>

<style scoped>
.v-card {
  margin-top: 2rem;
}
</style>
