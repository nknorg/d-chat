<template>
  <v-app>
    <app-bar />
    <SideBar />
    <default-view />
    <Footer app />
  </v-app>
</template>

<script lang="ts" setup>
import SideBar from '@/components/nav/SideBar.vue'
import AppBar from '@/layouts/default/AppBar.vue'
import DefaultView from './View.vue'
</script>
