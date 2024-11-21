<template>
  <span>
    <v-badge
      :color="global.darkTheme ? 'primary' : 'white'"
      right
    >
      <v-icon
        small
        :color="global.darkTheme ? 'white' : 'primary'"
        @click="openDocs"
        slot="badge"
      >mdi-help-circle-outline</v-icon>
      <slot />
    </v-badge>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import bus, { DocsEventTypes } from './DocsEventBus'
import global from '../../static/singleton'
import { openSidebarLink } from '@/helpers/docs.helper'

export default Vue.extend({
  name: 'DocsLinkBadge',
  data () {
    return {
      global,
    }
  },
  props: {
    to: {
      type: String,
    },
  },
  methods: {
    openDocs () {
      openSidebarLink(this.to)
    },
  },
})
</script>

<style scoped lang="sass">
  .badge
    cursor: pointer
</style>
