<template>
  <v-dialog v-model="state.dialog" activator="parent" transition="dialog-bottom-transition" fullscreen>
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="state.dialog = false"></v-btn>

        <v-toolbar-title>{{ $t('my_profile') }}</v-toolbar-title>

        <v-toolbar-items>
          <v-btn :text="$t('save')" variant="text" @click="save"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-list lines="two">
        <v-row>
          <v-col class="d-flex justify-center">
            <div class="position-relative">
              <v-avatar size="140" class="cursor-pointer" border @click="handleAvatarClick">
                <v-img v-if="state.avatarUrl" :src="state.avatarUrl" cover width="140"></v-img>
                <v-icon v-else size="140" icon="mdi-account"></v-icon>
              </v-avatar>
              <div class="position-absolute bottom-0 right-0">
                <Icon icon="material-symbols:flip-camera-ios-outline-rounded" width="30" height="30" class="cursor-pointer" @click="handleAvatarClick" />
              </div>
              <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
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
              <v-text-field v-model="state.nickname" :placeholder="$t('input_nickname')" variant="outlined" hide-details>
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
              <v-text-field v-model="state.address" variant="outlined" readonly hide-details>
                <template #prepend-inner>
                  <Icon icon="material-symbols:id-card-rounded" width="24" height="24" />
                </template>
                <template #append-inner>
                  <v-btn icon size="small" @click="copyToClipboard(state.address)">
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
  <ImageCropper v-model="state.showImageCropper" :image="state.tempImageFile as Blob" @cropped="handleCroppedImage" />
</template>

<script setup lang="ts">
import { useCacheStore } from '@/stores/cache'
import { useClientStore } from '@/stores/client'
import { useContactStore } from '@/stores/contact'
import { useNotificationStore } from '@/stores/notification'
import { copyToClipboard } from '@/utils/util'
import { IContactSchema, logger, SessionType } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import QrcodeVue from 'qrcode.vue'
import { onBeforeMount, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const clientStore = useClientStore()
const contactStore = useContactStore()
const notificationStore = useNotificationStore()
const fileInput = ref<HTMLInputElement | null>(null)

interface State {
  dialog: boolean
  showImageCropper: boolean
  nickname: string
  address: string
  avatarUrl: string
  avatarFile: File | null
  tempImageFile: File | null
}

const state = reactive<State>({
  dialog: false,
  showImageCropper: false,
  nickname: '',
  address: clientStore.lastSignInId,
  avatarUrl: '',
  avatarFile: null,
  tempImageFile: null
})

// Add watch for dialog state
watch(
  () => state.dialog,
  async (newValue) => {
    if (!newValue) {
      // Reset state when dialog is closed
      await resetState()
    }
  }
)

// Add reset function
const resetState = async () => {
  try {
    // Get current contact info from database
    const contact = await contactStore.queryContactInfo({
      type: SessionType.CONTACT,
      address: clientStore.lastSignInId
    })

    if (contact && typeof contact === 'object' && 'address' in contact && 'type' in contact) {
      // Reset nickname
      state.nickname = contact.firstName ?? contact.displayName

      // Reset avatar
      if (state.avatarUrl) {
        URL.revokeObjectURL(state.avatarUrl)
      }
      state.avatarUrl = ''
      state.avatarFile = null
      state.tempImageFile = null

      // Load avatar if exists
      if (contact.avatar) {
        const cacheStore = useCacheStore()
        const avatarCache = await cacheStore.getCache(contact.avatar)
        if (avatarCache) {
          state.avatarUrl = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
        }
      }
    }
  } catch (error) {
    logger.error('Failed to reset profile:', error)
    notificationStore.error({
      title: t('error'),
      message: t('failed_to_reset_profile')
    })
  }
}

onBeforeMount(async () => {
  try {
    // Get current contact info directly from database
    const contact = await contactStore.queryContactInfo({
      type: SessionType.CONTACT,
      address: clientStore.lastSignInId
    })
    if (contact && typeof contact === 'object' && 'address' in contact && 'type' in contact) {
      // Set nickname
      state.nickname = contact.firstName ?? contact.displayName

      // Load avatar if exists
      if (contact.avatar) {
        const cacheStore = useCacheStore()
        const avatarCache = await cacheStore.getCache(contact.avatar)
        if (avatarCache) {
          state.avatarUrl = avatarCache.source instanceof Blob ? URL.createObjectURL(avatarCache.source) : avatarCache.source
        }
      }
    }
  } catch (error) {
    logger.error('Failed to load profile:', error)
  }
})

const handleAvatarClick = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        notificationStore.error({
          title: t('error'),
          message: t('file_too_big')
        })
        return
      }

      state.tempImageFile = file
      state.showImageCropper = true
    } catch (error) {
      logger.error('Failed to update avatar:', error)
      notificationStore.error({
        title: t('error'),
        message: t('failed_to_update_avatar')
      })
    }

    // Clear input value to allow selecting the same file again
    target.value = ''
  }
}

const handleCroppedImage = async (result: { base64: string; blob: Blob; file: File }) => {
  try {
    // Clean up previous avatar URL if exists
    if (state.avatarUrl) {
      URL.revokeObjectURL(state.avatarUrl)
    }

    // Set the cropped image as the new avatar
    state.avatarUrl = result.base64
    state.avatarFile = result.file
    state.showImageCropper = false
  } catch (error) {
    logger.error('Failed to process cropped image:', error)
    notificationStore.error({
      title: t('error'),
      message: t('failed_to_process_image')
    })
  }
}

async function save() {
  try {
    const updates: Partial<IContactSchema> = {
      address: state.address,
      firstName: state.nickname
    }

    // If there's a new avatar file, cache it and update the avatar ID
    if (state.avatarFile) {
      const cacheStore = useCacheStore()
      const avatarId = await cacheStore.setAvatar(state.avatarFile)
      updates.avatar = avatarId
      // Clear the file after caching
      state.avatarFile = null
    }

    // Update contact info
    await contactStore.updateContact(updates)

    // Close dialog
    state.dialog = false
  } catch (error) {
    logger.error('Failed to save profile:', error)
    notificationStore.error({
      title: t('error'),
      message: t('failed_to_save_profile')
    })
  }
}

onUnmounted(() => {
  if (state.avatarUrl && state.avatarUrl.startsWith('blob:')) {
    URL.revokeObjectURL(state.avatarUrl)
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
