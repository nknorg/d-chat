<template>
    <v-btn icon="mdi-refresh" @click="refresh"></v-btn>
</template>

<script setup lang="ts">
function refresh() {
    window.location.reload()
}
</script>