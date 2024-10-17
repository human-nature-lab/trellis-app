<script setup lang="ts">
import { stringToColor } from '@/lib/string-to-color'
const props = defineProps<{
  name: string
}>()

</script>

<template>
  <div
    class="dot"
    :style="{ backgroundColor: stringToColor(props.name) }"
    :title="props.name"
  />
</template>

<style lang="sass" scoped>
.dot
  width: 16px
  height: 16px
  border-radius: 50%
  display: inline-block
  margin-right: 5px
  margin-bottom: 5px
</style>
