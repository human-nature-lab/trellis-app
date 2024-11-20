<script setup lang="ts">
import { useAttrs, useListeners } from 'vue'
import TextQuestion from './TextQuestion.vue'

const $attrs = useAttrs()
const $listeners = useListeners()

</script>

<template>
  <TextQuestion
    v-on="$listeners"
    v-bind="$attrs"
    :textarea="true"
  />
</template>