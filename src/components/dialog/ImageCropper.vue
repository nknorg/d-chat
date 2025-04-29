<template>
  <v-dialog v-model="state.dialog" max-width="500" :max-height="$vuetify.display.height">
    <v-card :max-height="$vuetify.display.height" class="d-flex flex-column flex-grow-1">
      <v-toolbar>
        <v-btn icon="mdi-close" @click="handleCancel"></v-btn>
        <v-toolbar-title>{{ $t('crop_image') }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn :text="$t('ok')" variant="text" @click="handleConfirm"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <VuePictureCropper class="cropper-container" :img="state.image" :options="cropperOptions" @ready="handleCropperReady" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, watch } from 'vue'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

const emit = defineEmits(['update:modelValue', 'cropped'])

const props = defineProps<{
  modelValue: boolean
  image: Blob
}>()

const state = reactive({
  dialog: props.modelValue,
  image: props.image instanceof Blob ? URL.createObjectURL(props.image) : ''
})

const cropperOptions = {
  viewMode: 1,
  dragMode: 'crop',
  aspectRatio: 1
}

const handleCropperReady = () => {
  // Cropper is ready
}

const handleConfirm = async () => {
  if (!cropper) return

  try {
    const base64 = cropper.getDataURL()
    // 从 base64 创建 Blob
    const base64Data = base64.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    const blob = new Blob(byteArrays, { type: 'image/png' })
    const file = new File([blob], 'avatar.png', { type: 'image/png' })

    emit('cropped', {
      base64,
      blob,
      file
    })
    state.dialog = false
  } catch (error) {
    console.error('Failed to crop image:', error)
  }
}

const handleCancel = () => {
  state.dialog = false
}

// Watch for dialog state changes
watch(
  () => props.modelValue,
  (newVal) => {
    state.dialog = newVal
  }
)

watch(
  () => state.dialog,
  (newVal) => {
    emit('update:modelValue', newVal)
  }
)

watch(
  () => props.image,
  (newVal) => {
    if (state.image) {
      URL.revokeObjectURL(state.image)
    }
    state.image = newVal instanceof Blob ? URL.createObjectURL(newVal) : ''
  }
)

onUnmounted(() => {
  if (state.image) {
    URL.revokeObjectURL(state.image)
  }
})
</script>

<style scoped>
.cropper-container {
  width: 100%;
  height: auto;
  max-height: calc(100vh - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-container img {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  object-fit: contain;
}

:deep(.v-card) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.v-card-text) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>
