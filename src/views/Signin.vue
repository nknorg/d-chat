<template>
  <v-app>
    <v-main>
      <v-container fluid class="justify-center align-center">
        <v-app-bar>
          <router-link to="/">
            <v-img height="40" width="140" :src="Logo"></v-img>
          </router-link>

          <v-spacer></v-spacer>
          <RefreshBtn />
          <NewTabBtn />
          <SwitchThemeBtn />
          <SwitchLanguageBtn />
        </v-app-bar>
        <Login />
      </v-container>
    </v-main>
  </v-app>
  <ConfirmDialog />
  <NotivueTemplate />
</template>

<script lang="ts" setup>
import Logo from '@assets/splash/logo.png'
</script>
