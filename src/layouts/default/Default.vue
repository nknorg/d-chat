<template>
  <v-app>
    <app-bar />
    <default-view />
    <Footer app color="transparent" />
  </v-app>
</template>

<script lang="ts" setup>
import AppBar from '@/layouts/default/AppBar.vue'
import DefaultView from './View.vue'
</script>
