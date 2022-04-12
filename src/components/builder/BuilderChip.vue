<template>
  <v-slide-x-transition>
    <v-chip
      v-if="visible"
      v-bind="$attrs"
      class="ml-2"
    >
      <slot />
    </v-chip>
  </v-slide-x-transition>
</template>

<script lang="ts">
export default {
  props: {
    visible: Boolean,
  }
}
</script>
