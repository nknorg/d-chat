<template>
  <Notivue v-slot="item" >
    <Notification :item="item" :theme="theme.global.name.value == 'dark' ? darkTheme : lightTheme" />
  </Notivue>
</template>

<script setup lang="ts">
import { darkTheme, lightTheme, Notification, Notivue } from 'notivue'
import { useTheme } from 'vuetify'

const theme = useTheme()
</script>
