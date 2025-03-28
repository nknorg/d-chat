<template>
  <v-card
    elevation="0"
    class="mx-auto"
    :title="$t('new_account')"
    :subtitle="$t('click_to_settings')"
    density="compact"
  >
    <template v-slot:prepend>
      <v-avatar size="40">
        <v-icon size="40" icon="mdi-account-circle"></v-icon>
      </v-avatar>
    </template>
  </v-card>
</template>
