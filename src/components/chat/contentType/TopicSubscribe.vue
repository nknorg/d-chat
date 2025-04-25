<template>
  <v-chip label color="info">
    <!--TODO: use contact info-->
    <a href="#" class="mr-2">
      {{ props.message.sender }}
    </a>
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
