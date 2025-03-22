<template>
  <v-card
    class="mx-auto pa-8 pt-4 pb-2 mb-8"
    max-width="600"
    elevation="8"
    rounded="lg"
  >

    <v-card elevation="0" @click="null"
      class="mx-auto"
      :subtitle="$t('click_to_switch_account')"
      :title="$t('new_account')"
    >
      <template v-slot:prepend>
        <v-avatar size="60" image="https://randomuser.me/api/portraits/women/12.jpg">
          <v-icon size="60" icon="mdi-account-circle"></v-icon>
        </v-avatar>
      </template>
    </v-card>

    <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
      {{ $t('wallet_password') }}
    </div>

    <v-text-field
      :type="'password'"
      density="compact"
      :placeholder="$t('input_password')"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
    ></v-text-field>

    <v-card
      class="mb-8"
      color="surface-variant"
      variant="tonal"
    >
      <v-card-text class="text-medium-emphasis text-caption">
        {{$t('login_warning')}}
      </v-card-text>
    </v-card>

    <v-btn
      class="mb-4"
      color="blue"
      size="large"
      variant="tonal"
      block
    >
      {{$t('login')}}
    </v-btn>

    <Footer />
  </v-card>
</template>
<script setup lang="ts">
</script>
