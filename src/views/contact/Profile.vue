<template>
  <v-row justify="center">
    <v-dialog
      v-model="state.dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="state.dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('my_profile') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              variant="text"
              @click="save()"
            >
              {{ $t('save') }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list>
          <v-container>
            <v-row>
              <v-col align="center">
                <Avatar size="large" :address="state.contact.address"
                        :name="state.nickName"
                        :avatar-bg-color="state.contact?.options?.avatarBgColor"
                        :avatar-fg-color="state.contact?.options.avatarFgColor" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field :label="$t('name')" hide-details="auto" v-model="state.nickName" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field :label="$t('d_chat_address')"
                              readonly hide-details="auto"
                              :model-value="props.targetId"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-list>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
  </v-row>
</template>


<script lang="ts" setup>
import { IContactSchema } from '../../../../schema/contact'
import { getNickName } from '../../../../util/contact'
import Avatar from '../../components/contact/Avatar.vue'
import { useClientStore } from '../../stores/client'
import { useContactStore } from '../../stores/contact'
import { useWalletStore } from '../../stores/wallet'

import { ComponentPublicInstance, defineProps, getCurrentInstance, onBeforeMount, reactive, watch } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const walletStore = useWalletStore()
const clientStore = useClientStore()
const contactStore = useContactStore()

const props = defineProps<{
  modelValue: boolean,
  targetId: string,
}>()

const state = reactive<{
  dialog: boolean,
  contact: IContactSchema,
  nickName: string,
}>({
  dialog: false,
  contact: null,
  nickName: ''
})

watch(
  () => props.modelValue,
  (dialog) => {
    state.dialog = dialog
  })

watch(
  () => state.dialog,
  (dialog) => {
    proxy.$emit('update:modelValue', dialog)
  })

onBeforeMount(async () => {
  state.contact = await contactStore.queryContactByAddress(props.targetId)
  state.nickName = getNickName(state.contact)
})

async function save() {
  await contactStore.setContact(state.contact.address, { name: state.nickName })
  state.dialog = false
}

</script>
