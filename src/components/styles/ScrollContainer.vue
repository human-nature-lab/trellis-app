<template>
  <div
    :class="'scroll-container d-flex flex-column ' + containerClass"
  >
    <div
      class="header pa-0"
      :class="isScrolled ? `elevation-${elevation}` : ''"
    >
      <slot name="header" />
    </div>
    <div
      ref="scroller"
      class="scrollable pa-0 flex-grow-1"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ScrollContainer',
  props: {
    elevation: {
      type: Number,
      default: 4,
    },
    containerClass: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      isScrolled: false,
    }
  },
  mounted () {
    (this.$refs.scroller as Element).addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  methods: {
    onScroll () {
      const el = this.$refs.scroller as Element
      this.isScrolled = el.scrollTop > 0
    },
  },
  computed: {
    attrs () {
      return 
    }
  }
})
</script>

<style lang="sass" scoped>
  .scroll-container
    height: 100%
    max-height: 100%
    width: 100%
    overflow: hidden
    position: relative
    .header
      width: 100%
      z-index: 1
      position: relative
      transition: all .3s
    .scrollable
      z-index: 0
      position: relative
      overflow-y: auto
</style>
