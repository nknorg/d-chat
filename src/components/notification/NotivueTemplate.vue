<template>
  <Notivue v-slot="item">
    <NotivueSwipe v-if="item.props.type === NotificationType.DEFAULT" :item="item">
      <Notification :item="item" :theme="theme.global.name.value == 'dark' ? darkTheme : lightTheme" />
    </NotivueSwipe>
    <NotivueRequestPermissionTemplate v-else-if="item.props.type === NotificationType.REQUEST_PERMISSION" :item="item" />
    <NotivueMessageNotificationTemplate v-else-if="item.props.type === NotificationType.MESSAGE_NOTIFICATION" :item="item as NotivueItem<{ message: MessageSchema }>" />
  </Notivue>
</template>

<script setup lang="ts">
import { NotificationType } from '@/stores/notification'
import { darkTheme, lightTheme, Notification, Notivue, NotivueSwipe, NotivueItem } from 'notivue'
import { useTheme } from 'vuetify'
import { MessageSchema } from '@d-chat/core'

const theme = useTheme()
</script>
