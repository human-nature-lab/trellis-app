<script setup lang="ts">
import { ref, watch } from 'vue'
import { FSEntry, file, FsRoot, getFs } from '@/cordova/file'
import EntryRow from './EntryRow.vue'

const props = defineProps<{
  value: string
  fs: FsRoot
}>()

const emit = defineEmits<{
  (event: 'input', value: string): void
  (event: 'update:fs', value: FsRoot): void
}>()

const entries = ref<FSEntry[]>([])
const loading = ref(false)
const error = ref<Error>()
const fullPath = ref<string>()



watch(() => [props.value, props.fs], async () => {
  error.value = undefined
  try {
    loading.value = true
    const fs = await getFs(props.fs)
    fullPath.value = fs.fullPath
    console.log('fs', fs.fullPath)
    const dir = await fs.getDirectory(props.value, { create: false })
    entries.value = await dir.readEntries()
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}, { immediate: true })

function onClick (entry: FSEntry) {
  console.log('click', entry)
  if (entry.isDirectory) {
    emit('input', entry.fullPath)
  } else {
    console.log('file', entry)
  }
}

function upOneLevel () {
  const parts = props.value.split('/').filter(p => !!p)
  console.log('parts', parts)
  parts.pop()
  emit('input', parts.length ? parts.join('/') : '/')
}

function updateFs (value: FsRoot) {
  console.log('updateFs', value)
  emit('input', '/')
  emit('update:fs', value)
}
</script>

<template>
  <v-col>
    <v-tabs
      :value="props.fs"
      @change="updateFs"
    >
      <v-tab tab-value="persistent">
        {{ $t('persistent') }}
      </v-tab>
      <v-tab tab-value="temporary">
        {{ $t('temporary') }}
      </v-tab>
      <v-tab tab-value="application">
        {{ $t('application') }}
      </v-tab>
      <v-tab tab-value="data">
        {{ $t('data') }}
      </v-tab>
      <v-tab tab-value="root">
        {{ $t('root') }}
      </v-tab>
      <v-tab tab-value="sdCard">
        {{ $t('sdCard') }}
      </v-tab>
    </v-tabs>
    <v-tabs-items>
      <v-row
        no-gutters
        class="justify-space-between"
      >
        <h4>{{ fullPath }}</h4>
        <v-btn
          @click="upOneLevel"
          icon
          :disabled="props.value === '/'"
        >
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>
      <v-progress-linear
        v-if="loading"
        indeterminate
      />
      <v-alert
        v-if="error"
        color="error"
      >
        {{ error }}
      </v-alert>
      <div v-if="!loading && !entries.length">
        {{ $t('empty_directory') }}
      </div>
      <v-virtual-scroll
        :items="entries"
        :height="1080"
        :item-height="56"
      >
        <template #default="{ item }">
          <EntryRow
            :entry="item"
            @click="onClick"
          />
        </template>
      </v-virtual-scroll>
    </v-tabs-items>
  </v-col>
</template>

<style lang="sass">

</style>
