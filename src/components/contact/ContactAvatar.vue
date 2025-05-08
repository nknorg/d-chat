<template>
  <v-skeleton-loader v-if="!item && !contactItem" type="avatar" color="transparent"></v-skeleton-loader>
  <v-avatar v-else :color="(item || contactItem)?.options?.avatarBgColor || 'primary'">
    <v-img v-if="avatarUrl" :src="avatarUrl" cover></v-img>
    <span v-else :style="{ color: (item || contactItem)?.options?.avatarFgColor || 'white' }">
      {{ displayName?.substring(0, 2).toUpperCase() }}
    </span>
  </v-avatar>
</template>

<script setup lang="ts">
import { ContactSchema, SessionType } from '@d-chat/core'
import { useCacheStore } from '@/stores/cache'
import { useContactStore } from '@/stores/contact'
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  item?: ContactSchema
  address?: string
}>()

const cacheStore = useCacheStore()
const contactStore = useContactStore()
const avatarUrl = ref<string>('')
const contactItem = ref<ContactSchema | null>(null)

const displayName = computed(() => {
  if (contactItem.value?.firstName) {
    return contactItem.value?.firstName
  }
  return contactItem.value?.displayName
})

const loadAvatar = async () => {
  if (contactItem.value?.avatar) {
    const avatarCache = await cacheStore.getCache(contactItem.value.avatar)
    if (avatarCache) {
      avatarUrl.value = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
    }
  } else {
    avatarUrl.value = ''
  }
}

watch(
  () => contactItem.value?.avatar,
  async () => {
    await loadAvatar()
  }
)

watch(
  () => props.item,
  (newItem) => {
    contactItem.value = newItem || null
  },
  { immediate: true }
)

watch(
  () => props.address,
  async (newAddress) => {
    if (newAddress && !props.item) {
      const contact = await contactStore.getContactInfo({ type: SessionType.CONTACT, address: newAddress })
      if (contact) {
        contactItem.value = contact
        await loadAvatar()
      }
    }
  },
  { immediate: true }
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
