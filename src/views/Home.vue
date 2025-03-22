<template>
  <v-app>
    <v-main>
      <v-container fluid class="justify-center align-center">
        <v-app-bar>
          <router-link to="/">
            <v-img
              height="40"
              width="140"
              :src="Logo"
            ></v-img>
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
</template>

<script lang="ts" setup>
import SettingsBtn from '@/components/button/SettingsBtn.vue'
import Logo from '@assets/splash/logo.png'
import { ComponentPublicInstance, getCurrentInstance } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

</script>
