<template>
  <span>
    <v-badge
         color="white"
         right
         v-if="isDebug">
      <v-icon
        dark
        small
        color="primary"
        slot="badge"
        @click="openDocs">help_outline</v-icon>
      <slot />
    </v-badge>
    <slot v-else/>
  </span>

</template>

<script lang="ts">
  import Vue from 'vue'
  import bus, {DocsEventTypes} from './DocsEventBus'
  export default Vue.extend({
    name: 'DocsLinkBadge',
    props: {
      to: {
        type: String
      }
    },
    methods: {
      openDocs () {
        bus.$emit(DocsEventTypes.open, this.to)
      }
    }
  })
</script>

<style scoped>

</style>
