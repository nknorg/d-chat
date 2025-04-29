<template>
  <v-card elevation="0" class="mx-auto" :title="$t('new_account')" density="compact">
    <template v-slot:prepend>
      <div class="position-relative">
        <v-icon size="40" icon="mdi-account-circle"></v-icon>

        <div v-if="clientStore.connectStatus == ConnectionStatus.Connecting" class="position-absolute right-0 top-0 text-warning">
          <Icon style="position: relative; left: 7px; bottom: 5px" width="24" icon="svg-spinners:bouncing-ball" />
        </div>
        <div v-else-if="clientStore.connectStatus == ConnectionStatus.Connected" class="position-absolute right-0 top-0 text-success">
          <Icon style="position: absolute; right: 0px; top: 4px" width="10" height="10" icon="mdi:circle" />
        </div>
        <div v-else-if="clientStore.connectStatus == ConnectionStatus.Disconnected" class="position-absolute right-0 top-0 text-grey">
          <Icon style="position: absolute; right: 0px; top: 4px" width="10" height="10" icon="mdi:circle" />
        </div>
      </div>
    </template>
    <template #subtitle>
      <v-btn class="ma-0 pa-0" height="auto">
        {{ $t('click_to_settings') }}
        <MyProfile />
      </v-btn>
    </template>
  </v-card>
</template>
<script lang="ts" setup>
import { ConnectionStatus } from '@d-chat/core'
import { useClientStore } from '@/stores/client'
import { Icon } from '@iconify/vue'

const clientStore = useClientStore()
</script>
