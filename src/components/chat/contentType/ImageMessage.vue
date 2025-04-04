<template>
  {{props.text}}
</template>
<script setup lang="ts">
import { defineProps, onBeforeMount, reactive } from 'vue'

const props = defineProps<{
  content: string
}>()

</script>

