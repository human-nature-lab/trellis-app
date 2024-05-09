<script setup lang="ts">
import Asset from '@/entities/trellis/Asset'

const props = defineProps<{
  asset: Asset
}>()
const emit = defineEmits<{
  (event: 'remove'): void
  (event: 'preview'): void
}>()
</script>

<template>
  <v-list-item>
    <v-list-item-action>
      <v-btn
        icon
        @click="emit('preview')"
      >
        <v-icon>mdi-play</v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        {{ asset.fileName }} ({{ asset.type }})
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn
        icon
        @click="emit('remove')"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<style lang="sass">

</style>
