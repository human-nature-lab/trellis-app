<script setup lang="ts">
import FileViewer from '@/components/files/FileViewer.vue'
import { FsRoot } from '@/cordova/file';
import { ref } from 'vue'

const root = ref<string>('/')
const fs = ref<FsRoot>('temporary')
</script>

<template>
  <FileViewer
    v-model="root"
    :fs="fs"
    @update:fs="fs = $event"
  />
</template>

<style lang="sass">

</style>
