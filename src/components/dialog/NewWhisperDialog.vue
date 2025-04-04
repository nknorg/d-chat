<template>
  <v-dialog activator="parent" width="600">
    <template v-slot:default="{ isActive }">
      <v-card class="pt-2">
        <v-card-title>
          <span class="text-h5">{{ $t('new_whisper') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-text-field
              :label="$t('send_to')"
              :placeholder="$t('enter_or_select_a_user_pubkey')"
              autofocus
              required
            >
              <template v-slot:append-inner>
                <!--TODO: select user-->
                <v-icon>mdi-clipboard-account</v-icon>
              </template>
            </v-text-field>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="isActive.value = false">
            {{ $t('cancel') }}
          </v-btn>
          <v-btn color="blue-darken-1" variant="text">
            {{ $t('ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts"></script>
