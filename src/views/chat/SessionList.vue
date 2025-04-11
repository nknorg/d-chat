<template>
  <v-card style="height: 100%; margin-bottom: 60px">
    <NoSessionList v-if="!sessionStore.sessionList || sessionStore.sessionList.length === 0" />
    <Splitpanes v-else class="default-theme" :horizontal="$vuetify.display.xs ? true : false">
      <Pane min-size="20" max-size="50" size="30">
        <div>
          <v-list select-strategy="single-leaf" lines="two" class="pa-0">
            <template v-for="(item, index) in sessionStore.sessionList">
              <v-list-item
                :value="index"
                :active="chatStore.currentTargetId == item.targetId"
                @click="selectedSession(item)"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <!--TODO: use contact info -->
                    {{ item.targetId.substring(0, 2) }}
                  </v-avatar>
                </template>
                <template v-slot:default="{}">
                  <v-list-item-title>{{ item.targetId.substring(0, 6) }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <SessionListMessageSummary :session-item="item" />
                  </v-list-item-subtitle>
                </template>
                <template v-slot:append>
                  <v-layout class="flex-column justify-center align-end" style="height: 50px">
                    <span class="body-regular">{{ formatChatTime(item.lastMessageAt) }}</span>
                    <UnreadBadge :count="item.unReadCount" />
                  </v-layout>
                </template>
              </v-list-item>
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
import UnreadBadge from '@/components/chat/UnreadBadge.vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { formatChatTime } from '@/utils/format'
import NoSessionList from '@/views/chat/NoSessionList.vue'
import { SessionSchema } from '@d-chat/core'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onBeforeMount, reactive } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

onBeforeMount(async () => {
  await sessionStore.queryListRecent(20, 0)
})

function selectedSession(s: SessionSchema) {
  chatStore.currentTargetId = s.targetId
  chatStore.currentTargetType = s.targetType
  sessionStore.readAllMessagesByTargetId(s.targetId, s.targetType)
}
</script>
