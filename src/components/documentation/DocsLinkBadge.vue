<template>
  <span>
    <v-badge :color="global.darkTheme ? 'primary' : 'white'" right>
      <v-icon
        small
        :color="global.darkTheme ? 'white' : 'primary'"
        @click="openDocs"
        slot="badge">help_outline</v-icon>
      <slot />
    </v-badge>
  </span>
</template>

<script lang="ts">
  import Vue from 'vue'
  import bus, {DocsEventTypes} from './DocsEventBus'
  import global from '../../static/singleton'
  export default Vue.extend({
    name: 'DocsLinkBadge',
    data () {
      return {
        global
      }
    },
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

<style scoped lang="sass">
  .badge
    cursor: pointer
</style>
