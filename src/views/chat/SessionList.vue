<template>
  <v-card style="height: 100%; margin-bottom: 60px">
    <Splitpanes class="default-theme" :horizontal="$vuetify.display.xs ? true : false">
      <Pane min-size="20" max-size="50" size="30">
        <div>
          <v-list select-strategy="single-leaf" lines="two" class="pa-0">
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar image="https://randomuser.me/api/portraits/women/26.jpg"></v-avatar>
              </template>
              <template v-slot:default="{}">
                <v-list-item-title>ABC</v-list-item-title>
                <v-list-item-subtitle>
                  <span><svg-icon name="image" :size="18" /></span>
                </v-list-item-subtitle>
              </template>
              <template v-slot:append class="fill-height">
                <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
                  <span>10:30</span>
                  <v-badge inline color="primary" content="1" />
                </v-layout>
              </template>
            </v-list-item>
            <v-divider></v-divider>
          </v-list>
          <v-list select-strategy="single-leaf" lines="two" class="pa-0">
            <v-list-item active>
              <template v-slot:prepend>
                <v-avatar image="https://randomuser.me/api/portraits/women/33.jpg"></v-avatar>
              </template>
              <template v-slot:default="{}">
                <v-list-item-title> Alice</v-list-item-title>
                <v-list-item-subtitle>
                  <span><svg-icon name="image" :size="18" /></span>
                </v-list-item-subtitle>
              </template>
              <template v-slot:append class="fill-height">
                <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
                  <span>10:30</span>
                  <v-badge inline color="primary" content="1" />
                </v-layout>
              </template>
            </v-list-item>
            <v-divider></v-divider>
          </v-list>
          <v-list select-strategy="single-leaf" lines="two" class="pa-0">
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar image="https://randomuser.me/api/portraits/women/29.jpg"></v-avatar>
              </template>
              <template v-slot:default="{}">
                <v-list-item-title>DDDDEEE</v-list-item-title>
                <v-list-item-subtitle>
                  <span><svg-icon name="image" :size="18" /></span>
                </v-list-item-subtitle>
              </template>
              <template v-slot:append class="fill-height">
                <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
                  <span>10:30</span>
                  <v-badge inline color="primary" content="1" />
                </v-layout>
              </template>
            </v-list-item>
            <v-divider></v-divider>
          </v-list>
        </div>
      </Pane>
      <Pane>
        <ChatContainer target-id="" />
      </Pane>
    </Splitpanes>
  </v-card>
</template>

<script setup lang="ts">
import ChatContainer from '@/components/chat/ChatContainer.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
</script>
<style scoped></style>
