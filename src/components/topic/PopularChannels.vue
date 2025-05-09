<template>
  <div class="text-h6 mb-4">{{ $t('popular_channels') }}</div>
  <v-row class="flex-grow-0" style="max-width: 800px">
    <v-col v-for="channel in recommendedChannels" :key="channel.topic" cols="12" sm="6" md="6">
      <v-card variant="tonal">
        <v-card-item>
          <template #prepend>
            <v-avatar color="primary" size="40">
              <span class="body-large">{{ channel.topic.substring(0, 2).toUpperCase() }}</span>
            </v-avatar>
          </template>
          <v-card-title>{{ channel.name }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <div class="d-flex align-center">
            <Icon icon="material-symbols:group" class="mr-2" />
            <span class="text-medium-emphasis">{{ channelMembers[channel.topic] || 0 }} {{ $t('members') }}</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="primary" variant="tonal" :loading="loadingChannels.includes(channel.topic)" @click="subscribeChannel(channel.topic)">
            {{ $t('join') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { logger, SessionSchema, SessionType } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const loadingChannels = ref<string[]>([])
const channelMembers = ref<Record<string, number>>({})

const recommendedChannels = [
  {
    topic: 'd-chat',
    name: '#d-chat'
  },
  {
    topic: '中文',
    name: '#中文'
  },
  {
    topic: 'nkn-chat',
    name: '#nkn-chat'
  },
  {
    topic: 'sport',
    name: '#sport'
  }
]

async function loadChannelMembers() {
  for (const channel of recommendedChannels) {
    try {
      const count = await chatStore.getTopicSubscribersCount(channel.topic)
      channelMembers.value[channel.topic] = count
    } catch (e) {
      logger.error('Failed to get channel members count:', e)
      channelMembers.value[channel.topic] = 0
    }
  }
}

onMounted(() => {
  loadChannelMembers()
})

const subscribeChannel = async (topic: string) => {
  loadingChannels.value.push(topic)

  try {
    await chatStore.subscribeTopic(topic)
  } catch (e) {
    logger.error(e)
  }
  loadingChannels.value = loadingChannels.value.filter((t) => t !== topic)

  if (!sessionStore.sessionList.find((session) => session.targetId === topic)) {
    sessionStore.sessionList.unshift(
      new SessionSchema({
        isTop: false,
        lastMessageOutbound: true,
        targetId: topic,
        targetType: SessionType.TOPIC,
        lastMessageAt: new Date().getTime(),
        unReadCount: 0
      })
    )
  }
  chatStore.currentTargetType = SessionType.TOPIC
  await chatStore.setCurrentChatTargetId(topic)
  emit('close')
}
</script>
