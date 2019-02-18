<template>
  <div
    class="loading-container"
    :style="containerStyles">
    <div
      class="loading-circle"
      :style="circleStyles"></div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    name: 'TrellisLoadingCircle',
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
          height: this.size
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

<style lang="sass" scoped>
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

  @keyframes rotate
    0%
      transform: rotate(0deg)
    100%
      transform: rotate(360deg)
</style>
