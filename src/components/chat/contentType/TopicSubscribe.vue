<template>
  <v-chip label color="info">
    <!--TODO: use contact info-->
    <router-link to="" class="mr-2">
      {{ props.message.sender.substring(0, 6) }}
    </router-link>
    {{ $t('joined_channel') }}
  </v-chip>
</template>
<script setup lang="ts">
import { MessageSchema } from '@d-chat/core'
import { defineProps } from 'vue'

const props = defineProps<{
  message: MessageSchema
}>()
</script>
