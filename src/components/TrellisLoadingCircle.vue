<template>
  <div
    class="loading-container"
    :style="containerStyles">
    <div
      class="loading-circle"
      :style="circleStyles" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../static/singleton'
  export default Vue.extend({
    name: 'TrellisLoadingCircle',
    data () {
      return {
        global
      }
    },
    props: {
      color: {
        type: String,
        default: 'primary'
      },
      size: {
        type: String,
        default: '50px'
      },
      thickness: {
        type: Number,
        default: 4
      },
      padding: {
        type: String,
        default: '0'
      },
      margin: {
        type: String,
        default: '0'
      }
    },
    computed: {
      borderColor () {
        // @ts-ignore
        return this.$vuetify.theme[this.color]
      },
      containerStyles (): object {
        return {
          width: this.size,
          height: this.size,
          padding: this.padding,
          margin: this.margin
        }
      },
      circleStyles (): object {
        return {
          width: this.size,
          height: this.size,
          borderWidth: this.thickness,
          borderTopColor: this.borderColor,
          borderLeftColor: this.borderColor
        }
      }
    }
  })
</script>

<style lang="sass" >
  .loading-container
    display: block
    overflow: visible
    .loading-circle
      display: block
      border-radius: 50%
      height: 100%
      width: 100%
      border: 4px solid rgba(0,0,0,0)
      animation: rotate 1s linear infinite

  .cpu-optimized
    .loading-container
      .loading-circle
        border-rad

  @keyframes rotate
    0%
      transform: rotate(0deg)
    100%
      transform: rotate(360deg)
</style>
