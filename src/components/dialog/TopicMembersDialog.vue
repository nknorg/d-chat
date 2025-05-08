<template>
  <v-dialog v-model="dialog" max-width="800">
    <v-card class="d-flex flex-column" style="height: 80vh">
      <v-toolbar>
        <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        <v-toolbar-title>{{ $t('channel_members') }}</v-toolbar-title>
      </v-toolbar>

      <v-container class="pa-5">
        <!-- Topic Info Section -->
        <div class="d-flex align-center">
          <TopicAvatar :item="topicInfo" size="64" />
          <div class="ml-4">
            <div class="text-h6">{{ topicInfo?.topic }}</div>
            <v-chip color="blue" density="comfortable" size="small" variant="tonal">
              <template #prepend>
                <Icon icon="material-symbols:groups-2-rounded" class="mr-1"></Icon>
              </template>
              <template #append>
                <span class="body-small">{{ contactStore.contactInfoMap[key]?.data['count'] }}</span>
              </template>
            </v-chip>
          </div>
        </div>
      </v-container>

      <v-divider class="mb-2"></v-divider>

      <!-- Members List -->
      <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
        <template v-if="isLoading">
          <v-list lines="two">
            <v-list-item v-for="n in 5" :key="n" class="px-6 py-2">
              <template #prepend>
                <v-skeleton-loader type="avatar" width="40" height="40"></v-skeleton-loader>
              </template>
              <v-skeleton-loader type="text" width="200"></v-skeleton-loader>
              <v-skeleton-loader type="text" width="150" class="mt-1"></v-skeleton-loader>
            </v-list-item>
          </v-list>
        </template>
        <v-list v-else lines="two">
          <v-list-item v-for="member in members" :key="member.address" class="px-6 py-2" @click="null">
            <ContactProfile :activator="'parent'" :address="member.address" />
            <template #prepend>
              <ContactAvatar :item="member" />
            </template>
            <v-list-item-title>{{ member.displayName || ContactService.getNameByContact(member) }}</v-list-item-title>
            <v-list-item-subtitle>{{ member.address }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'
import { ContactSchema, ContactService, logger, SessionType, TopicSchema } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  topicId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const contactStore = useContactStore()
const chatStore = useChatStore()

const dialog = ref(props.modelValue)
const topicInfo = ref<TopicSchema>()
const members = ref<ContactSchema[]>([])
const isLoading = ref(false)

const key = computed(() => (props.topicId ? `${SessionType.TOPIC}-${props.topicId}` : ''))

watch(
  () => props.modelValue,
  (newValue) => {
    dialog.value = newValue
  }
)

watch(
  () => dialog.value,
  (newValue) => {
    emit('update:modelValue', newValue)
  }
)

async function loadTopicInfo() {
  if (!props.topicId) return

  try {
    isLoading.value = true
    const topic = await contactStore.getContactInfo({ type: SessionType.TOPIC, address: props.topicId })
    if (topic) {
      topicInfo.value = topic

      // First get subscribers from database
      const subscribers = await chatStore.getTopicSubscribersFromDb(props.topicId)
      const memberPromises = subscribers.map((address) => contactStore.getContactInfo({ type: SessionType.CONTACT, address }))
      const memberResults = await Promise.all(memberPromises)
      members.value = memberResults.filter((m): m is ContactSchema => m !== null)

      // Then sync subscribers in background
      chatStore
        .syncTopicSubscribers(props.topicId)
        .then(async () => {
          // After sync, update the members list
          const updatedSubscribers = await chatStore.getTopicSubscribersFromDb(props.topicId)
          const updatedMemberPromises = updatedSubscribers.map((address) => contactStore.getContactInfo({ type: SessionType.CONTACT, address }))
          const updatedMemberResults = await Promise.all(updatedMemberPromises)
          members.value = updatedMemberResults.filter((m): m is ContactSchema => m !== null)
        })
        .catch((e) => {
          logger.error('Failed to sync topic subscribers:', e)
        })
    }
  } catch (e) {
    logger.error('Failed to load topic info:', e)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => dialog.value,
  async (newValue) => {
    if (newValue) {
      await loadTopicInfo()
    }
  }
)

watch(
  () => props.topicId,
  async (newValue) => {
    if (newValue && dialog.value) {
      await loadTopicInfo()
    }
  }
)
</script>
