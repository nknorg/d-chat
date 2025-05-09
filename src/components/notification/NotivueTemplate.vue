<template>
  <Notivue v-slot="item">
    <NotivueSwipe v-if="item.props.type === NotificationType.DEFAULT" :item="item">
      <Notification :item="item" :theme="theme.global.name.value == 'dark' ? darkTheme : lightTheme" />
    </NotivueSwipe>
    <NotivueRequestPermissionTemplate v-else-if="NotificationType.REQUEST_PERMISSION" :item="item" />
  </Notivue>
</template>

<script setup lang="ts">
import { NotificationType } from '@/stores/notification'
import { darkTheme, lightTheme, Notification, Notivue, NotivueSwipe } from 'notivue'
import { useTheme } from 'vuetify'

const theme = useTheme()
</script>
