<template>
  <v-card elevation="0" class="mx-auto" density="compact">
    <template #title>
      {{ contactStore?.myProfile?.displayName }}
    </template>
    <template #prepend>
      <div class="position-relative">
        <v-avatar v-if="avatarUrl" size="40">
          <v-img :src="avatarUrl" cover></v-img>
        </v-avatar>
        <v-icon v-else size="40" icon="mdi-account-circle"></v-icon>
        <div v-if="clientStore.connectStatus == ConnectionStatus.Connecting" class="position-absolute right-0 top-0 text-warning">
          <Icon style="position: relative; left: 7px; bottom: 5px" width="24" icon="svg-spinners:bouncing-ball" />
        </div>
        <div v-else-if="clientStore.connectStatus == ConnectionStatus.Connected" class="position-absolute right-0 top-0 text-success">
          <Icon style="position: absolute; right: 0; top: 4px" width="10" height="10" icon="mdi:circle" />
        </div>
        <div v-else-if="clientStore.connectStatus == ConnectionStatus.Disconnected" class="position-absolute right-0 top-0 text-grey">
          <Icon style="position: absolute; right: 0; top: 4px" width="10" height="10" icon="mdi:circle" />
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
import { useCacheStore } from '@/stores/cache'
import { useClientStore } from '@/stores/client'
import { useContactStore } from '@/stores/contact'
import { ConnectionStatus } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const clientStore = useClientStore()
const contactStore = useContactStore()
const cacheStore = useCacheStore()
const avatarUrl = ref<string>('')

const loadAvatar = async () => {
  if (contactStore?.myProfile?.avatar) {
    const avatarCache = await cacheStore.getCache(contactStore.myProfile.avatar)
    if (avatarCache) {
      avatarUrl.value = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
    }
  } else {
    avatarUrl.value = ''
  }
}

watch(
  () => contactStore?.myProfile?.avatar,
  async () => {
    await loadAvatar()
  }
)

onMounted(async () => {
  await loadAvatar()
})

onUnmounted(() => {
  if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarUrl.value)
  }
})
</script>
