<script setup lang="ts">
import { reactive } from 'vue'
import { DocxOpts, defaultOpts } from '@/services/doc'
import global from '@/static/singleton'
import LocaleSelector from '../LocaleSelector.vue'

const props = defineProps<{
  value?: DocxOpts
}>()
const emit = defineEmits<{
  (event: 'input', value: DocxOpts): void
}>()

const opts = reactive(props.value || Object.assign({}, defaultOpts))

if (!props.value) {
  emit('input', opts)
}

</script>

<template>
  <v-container>
    <v-checkbox
      v-for="(_, name) in opts"
      :key="name"
      v-model="opts[name]"
      :label="name"
    />
    <LocaleSelector @change="global.locale = $event" />
  </v-container>
</template>

<style lang="sass">

</style>
