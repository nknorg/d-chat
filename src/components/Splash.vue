<template>
  <v-app>
    <v-container class="fill-height d-flex flex-column">
      <v-layout class="d-flex flex-column align-center justify-center">
        <v-img contain width="322" max-width="322" max-height="180" :src="Logo" />

        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script lang="ts" setup>
import Logo from '@assets/splash/logo.png'
</script>
