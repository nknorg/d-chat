<template>
  <v-bottom-navigation
    v-model="state.value"
    color="primary"
    horizontal
  >
    <v-btn :to="tabsLink[0]">
      <svg-icon name="chat" :size="28"/>
<!--      {{ $t('menu_chat') }}-->
    </v-btn>

    <v-btn :to="tabsLink[1]">
      <svg-icon name="wallet" :size="28"/>
<!--      {{ $t('menu_wallet') }}-->
    </v-btn>

    <v-btn :to="tabsLink[2]">
      <svg-icon name="settings" :size="28"/>
<!--      {{ $t('menu_settings') }}-->
    </v-btn>
  </v-bottom-navigation>

</template>

<script lang="ts" setup>
import {ComponentPublicInstance, getCurrentInstance, reactive} from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const tabsLink = ['/chat', '/wallet', '/setting']
const state = reactive({
  value: 0,
})

// function changeTab(n: number) {
//   if (n == null) {
//     return
//   }
//   proxy.$router.push(tabsLink[n])
// }

</script>
