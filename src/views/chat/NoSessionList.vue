<template>
  <v-layout class="fill-height overflow-y-auto">
    <v-container class="d-flex flex-column align-center mt-4">
      <div class="text-h5 mb-8">{{ $t('chat_no_messages_title') }}</div>
      <div class="text-subtitle-1 text-medium-emphasis mb-8">{{ $t('chat_no_messages_desc') }}</div>

      <PopularChannels />
    </v-container>
  </v-layout>
</template>
