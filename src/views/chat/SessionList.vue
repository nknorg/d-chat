<template>
  <v-card style="height: 100%; margin-bottom: 60px">
    <NoSessionList v-if="!sessionStore.sessionList || sessionStore.sessionList.length === 0" />
    <Splitpanes v-else class="default-theme" :horizontal="!!$vuetify.display.xs">
      <Pane min-size="20" max-size="50" size="30">
        <div>
          <v-list select-strategy="single-leaf" lines="two" class="pa-0">
            <template v-for="item in sessionStore.sessionList" :key="item.targetId">
              <SessionListItem :item="item" />
              <v-divider />
            </template>
          </v-list>
        </div>
      </Pane>
      <Pane>
        <ChatContainer
          :target-id="chatStore.currentTargetId"
          :target-type="chatStore.currentTargetType"
        />
      </Pane>
    </Splitpanes>
  </v-card>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import NoSessionList from '@/views/chat/NoSessionList.vue'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onBeforeMount } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

onBeforeMount(async () => {
  await sessionStore.queryListRecent(20, 0)
})
</script>
