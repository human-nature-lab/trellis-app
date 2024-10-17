<script setup lang="ts">
import { FSEntry } from '@/cordova/file'
import { watch, ref } from 'vue'

const props = defineProps<{
  entry: FSEntry
}>()
const emit = defineEmits<{
  (event: 'click', entry: FSEntry): void
}>()

const meta = ref<Metadata>()
watch(() => props.entry, async (value) => {
  meta.value = undefined
  if (!value || !value.isFile) return
  console.log('entry', value)
  meta.value = await value.getMetadata()
  console.log('meta', meta.value)
}, { immediate: true })
</script>

<template>
  <v-list-item
    @click="emit('click', entry)"
  >
    <v-list-item-icon>
      <v-icon v-if="entry.isDirectory">
        mdi-folder
      </v-icon>
      <v-icon v-else>
        mdi-file
      </v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>
        {{ entry.name }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="meta">
        {{ meta.size }} {{ meta.modificationTime }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<style lang="sass">

</style>
