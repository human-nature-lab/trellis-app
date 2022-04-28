<template>
  <v-slide-y-transition>
    <v-col v-if="value">
      <slot />
    </v-col>
  </v-slide-y-transition>
</template>

<script lang="ts">
import expandAll from '../../events/builder/expandAll'
import Vue from 'vue'

export default Vue.extend({
  name: 'ExpandSection',
  props: {
    value: Boolean,
    global: Boolean,
  },
  created () {
    if (this.global) {
      expandAll.$on('change', this.update)
    }
  },
  beforeDestroy () {
    expandAll.$off('change', this.update)
  },
  methods: {
    update (visible: boolean) {
      console.log('updating', visible)
      this.$emit('input', visible)
    },
  },
})
</script>
