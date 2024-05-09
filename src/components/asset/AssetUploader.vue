<script setup lang="ts">
import { ref } from 'vue'
import { visible, opts, uploaderRef, resolver, rejecter } from './asset-upload'
import TrellisFileUpload from '../import/TrellisFileUpload.vue'

const files = ref<File[]>([])
function onUpload (f: File) {
  files.value.push(f)
}

function onDone () {
  if (files.value.length) {
    resolver.value(files.value)
  } else {
    rejecter.value(new Error('No files uploaded'))
  }
  files.value = []
}

</script>

<template>
  <div
    ref="uploaderRef"
  >
    <TrellisFileUpload
      v-if="visible"
      v-model="visible"
      :extensions="opts?.extensions"
      :max="opts?.max"
      :multiple="!!opts && opts.max > 1"
      :upload-file="onUpload"
      :title="$t('upload_files')"
      @close="onDone"
      @upload-done="onDone"
    />
  </div>
</template>

<style lang="sass">

</style>
