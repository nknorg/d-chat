<template>
  <v-app>
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col class="d-flex justify-center align-center">
          <v-img
            contain
            width="322"
            max-width="322"
            :src="Logo"
          />
        </v-col>
        <v-col class="d-flex justify-center align-center">
          <v-progress-circular
            :size="70"
            :width="7"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script lang="ts" setup>
import Logo from '@assets/splash/logo.png'
</script>
