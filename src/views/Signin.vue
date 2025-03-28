<template>
  <v-app>
    <v-main>
      <v-container fluid class="justify-center align-center">
        <v-app-bar>
          <router-link to="/">
            <v-img height="40" width="140" :src="Logo"></v-img>
          </router-link>

          <v-spacer></v-spacer>
          <SwitchThemeBtn />
          <SwitchLanguageBtn />
          <SettingsBtn />
        </v-app-bar>

        <Login />
      </v-container>
    </v-main>
  </v-app>
  <ConfirmDialog />
  <Notivue v-slot="item">
    <Notification
      :item="item"
      :theme="theme.global.name.value == 'dark' ? darkTheme : lightTheme"
    />
  </Notivue>
</template>

<script lang="ts" setup>
import SettingsBtn from '@/components/button/SettingsBtn.vue'
import Logo from '@assets/splash/logo.png'
import { Notivue, Notification, darkTheme, lightTheme } from 'notivue'
import { useTheme } from 'vuetify'

const theme = useTheme()
</script>
