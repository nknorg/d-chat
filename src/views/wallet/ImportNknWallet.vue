<template>
  <v-tabs
    v-model="state.tab"
    bg-color="primary"
  >
    <v-tab value="one">{{ $t('tab_keystore') }}</v-tab>
    <v-tab value="two">{{ $t('tab_seed') }}</v-tab>
  </v-tabs>

  <v-window v-model="state.tab">
    <v-window-item value="one">
      <ImportNknWalletByKeystore />
    </v-window-item>

    <v-window-item value="two">
      <ImportNknWalletBySeed />
    </v-window-item>
  </v-window>
</template>

<script lang="ts" setup>
import ImportNknWalletBySeed from './ImportNknWalletBySeed.vue'
import ImportNknWalletByKeystore from './ImportNknWalletByKeystore.vue'
import {ComponentPublicInstance, getCurrentInstance, reactive} from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const state = reactive({
  tab: 0,
})

</script>
