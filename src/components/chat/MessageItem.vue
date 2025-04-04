<template>
  <v-row  dense>
    <v-col  cols="auto">
      <v-avatar image="https://randomuser.me/api/portraits/women/33.jpg" width="200"></v-avatar>
    </v-col>
    <v-col>
      <!-- TODO: add contact name-->
      <h4>
        Alice
      </h4>
      <v-alert
        class="alert target-alert body-regular"
        color="primary"
        theme="dark"
        prominent
        style="flex: auto"
      >
        <MessageContent :type="'1'" :content="'asdasdasd'" />
        <div class="footer">
          <v-label class="body-small">10:30</v-label>
        </div>
      </v-alert>
    </v-col>
  </v-row>
  <v-alert

    class="alert self-alert body-regular"
    color="green"
    theme="dark"
    prominent
    style="flex: auto"
  >
    <MessageContent :type="'1'" :content="'asdasdasd'" />
    <div class="footer">
      <v-label class="body-small"> 10:30 </v-label>
    </div>
  </v-alert>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

import MessageContent from './MessageContent.vue'

const props = defineProps<{

}>()
</script>
<style>
.alert {
  flex-grow: 0 !important;
  overflow: unset !important;
  /*min-height: 50px !important;*/
}

.target-alert {
  border-radius: 10px !important;
  border-top-left-radius: 0 !important;
}

.self-alert {
  align-self: end;
  border-radius: 10px !important;
  border-bottom-right-radius: 0 !important;
}

.footer {
  display: flex;
  justify-content: end;
}
</style>
