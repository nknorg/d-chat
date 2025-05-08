<template>
  <v-dialog v-model="state.dialog" :activator="props.activator" transition="dialog-bottom-transition" max-width="800">
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="state.dialog = false"></v-btn>
        <v-toolbar-title>{{ $t('profile') }}</v-toolbar-title>
      </v-toolbar>
      <v-list lines="two">
        <v-row>
          <v-col class="d-flex justify-center">
            <div class="position-relative">
              <v-avatar size="140" color="grey" border>
                <v-img v-if="state.avatarUrl" :src="state.avatarUrl" cover width="140"></v-img>
                <v-icon v-else size="140" icon="mdi-account"></v-icon>
              </v-avatar>
            </div>
          </v-col>
        </v-row>
        <v-divider class="mt-4"></v-divider>
        <v-container max-width="600">
          <v-row>
            <v-col>
              <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                {{ $t('nickname') }}
              </div>
              <v-text-field :model-value="state.nickname" variant="outlined" readonly hide-details>
                <template #prepend-inner>
                  <Icon icon="material-symbols:account-circle" width="24" height="24" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                {{ $t('d_chat_address') }}
              </div>
              <v-text-field :model-value="state.address" variant="outlined" readonly hide-details>
                <template #prepend-inner>
                  <Icon icon="material-symbols:id-card-rounded" width="24" height="24" />
                </template>
                <template #append-inner>
                  <v-btn icon variant="text" size="small" @click="copyToClipboard(state.address)">
                    <Icon icon="material-symbols:content-copy-outline-rounded" width="24" height="24" />
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center">
              <v-card variant="outlined" class="d-flex">
                <qrcode-vue :value="state.address" :size="200" level="H" />
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useCacheStore } from '@/stores/cache'
import { useContactStore } from '@/stores/contact'
import { useNotificationStore } from '@/stores/notification'
import { copyToClipboard } from '@/utils/util'
import { ContactService, logger, SessionType, ContactSchema } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import QrcodeVue from 'qrcode.vue'
import { onUnmounted, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'

const { t } = useI18n()
const contactStore = useContactStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()

interface Props {
  address?: string
  contact?: ContactSchema
  modelValue?: boolean
  activator?: 'parent' | string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

interface State {
  dialog: boolean
  nickname: string
  address: string
  avatarUrl: string
}

const state = reactive<State>({
  dialog: props.modelValue ?? false,
  nickname: '',
  address: props.address ?? props.contact?.address ?? '',
  avatarUrl: ''
})

// Add watch for dialog state
watch(
  () => state.dialog,
  async (newValue) => {
    // Sync with v-model if provided
    if (props.modelValue !== undefined) {
      emit('update:modelValue', newValue)
    }

    // Load data when dialog opens
    if (newValue) {
      try {
        // Request latest contact data
        await chatStore.requestContactData(state.address)

        if (props.contact) {
          // If contact is provided, use it directly
          state.nickname = props.contact.firstName ?? props.contact.displayName ?? ContactService.getNameByContact(props.contact)
          state.address = props.contact.address

          // Load avatar if exists
          if (props.contact.avatar) {
            const cacheStore = useCacheStore()
            const avatarCache = await cacheStore.getCache(props.contact.avatar)
            if (avatarCache) {
              state.avatarUrl = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
            }
          }
        } else if (props.address) {
          // Get contact info from database if only address is provided
          const contact = await contactStore.queryContactInfo({
            type: SessionType.CONTACT,
            address: props.address
          })
          if (contact && typeof contact === 'object' && 'address' in contact && 'type' in contact) {
            // Set nickname
            state.nickname = contact.firstName ?? contact.displayName ?? ContactService.getNameByContact(contact)

            // Load avatar if exists
            if (contact.avatar) {
              const cacheStore = useCacheStore()
              const avatarCache = await cacheStore.getCache(contact.avatar)
              if (avatarCache) {
                state.avatarUrl = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
              }
            }
          }
        }
      } catch (error) {
        logger.error('Failed to load contact profile:', error)
        notificationStore.error({
          title: t('error'),
          message: t('failed_to_load_contact_profile')
        })
      }
    }
  }
)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined) {
      state.dialog = newValue
    }
  }
)

onUnmounted(() => {
  if (state.avatarUrl && state.avatarUrl.startsWith('blob:')) {
    URL.revokeObjectURL(state.avatarUrl)
  }
})
</script>
