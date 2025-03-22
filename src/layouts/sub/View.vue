<template>
  <v-main>
    <v-btn @click="back">xxxx</v-btn>
    <router-view/>
  </v-main>
</template>

<script lang="ts" setup>
import { ComponentPublicInstance, getCurrentInstance } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

function back() {
  proxy.$router.back()
}
</script>
