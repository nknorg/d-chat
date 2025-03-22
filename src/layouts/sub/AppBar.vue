<template>
  <v-app-bar flat>
    <v-app-bar-title>

    </v-app-bar-title>
  </v-app-bar>
</template>

<script lang="ts" setup>
import {ComponentPublicInstance, getCurrentInstance} from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

</script>
