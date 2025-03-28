<template>
  <v-dialog v-model="dialogStore.confirmDialog"  max-width="300">
    <v-card color="error">
      <template v-slot:title>
        <span class="font-weight-black">{{dialogStore.title}}</span>
      </template>

      <v-card-text >
        {{dialogStore.content}}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialogStore.handleConfirmCancel()">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn text @click="dialogStore.handleConfirmOk()">
          {{ $t('ok') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog'

const dialogStore = useDialogStore()
</script>
