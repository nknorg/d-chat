<template>
  <v-skeleton-loader v-if="!item && !topicItem" type="avatar" color="transparent"></v-skeleton-loader>
  <v-avatar v-else :color="(item || topicItem)?.options?.avatarBgColor || 'primary'" class="relative" style="overflow: visible">
    <v-img v-if="avatarUrl" :src="avatarUrl" cover></v-img>
    <span v-else class="text-h6" :style="{ color: (item || topicItem)?.options?.avatarFgColor || 'white' }">
      {{ displayName.substring(0, 2).toUpperCase() }}
    </span>
    <span style="position: absolute; top: -4px; right: -4px">
      <v-chip variant="outlined" size="14">
        <svg-icon name="group" color="#fff" :size="14" />
      </v-chip>
    </span>
  </v-avatar>
</template>

<script setup lang="ts">
import { TopicSchema, SessionType } from '@d-chat/core'
import { useCacheStore } from '@/stores/cache'
import { useContactStore } from '@/stores/contact'
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  item?: TopicSchema
  topicName?: string
}>()

const cacheStore = useCacheStore()
const contactStore = useContactStore()
const avatarUrl = ref<string>('')
const topicItem = ref<TopicSchema | null>(null)

const displayName = computed(() => {
  return topicItem.value?.topic || ''
})

const loadAvatar = async () => {
  if (topicItem.value?.avatar) {
    const avatarCache = await cacheStore.getCache(topicItem.value.avatar)
    if (avatarCache) {
      avatarUrl.value = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
    }
  } else {
    avatarUrl.value = ''
  }
}

watch(
  () => topicItem.value?.avatar,
  async () => {
    await loadAvatar()
  }
)

watch(
  () => props.item,
  (newItem) => {
    topicItem.value = newItem || null
  },
  { immediate: true }
)

watch(
  () => props.topicName,
  async (newTopicName) => {
    if (newTopicName && !props.item) {
      const topic = await contactStore.getContactInfo({ type: SessionType.TOPIC, address: newTopicName })
      if (topic) {
        topicItem.value = topic as TopicSchema
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
