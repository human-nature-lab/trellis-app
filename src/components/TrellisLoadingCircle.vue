<template>
  <div class="loading-container">
    <div
      class="loading-circle"
      :style="{borderTopColor: borderColor, borderLeftColor: borderColor}"></div>
  </div>
</template>

<script>
  export default {
    name: 'TrellisLoadingCircle',
    props: {
      color: {
        type: String,
        default: 'primary'
      }
    },
    computed: {
      borderColor () {
        return this.$vuetify.theme[this.color]
      }
    }
  }
</script>

<style lang="sass" scoped>
  .loading-container
    overflow: visible
    .loading-circle
      display: block
      border-radius: 50%
      width: 50px
      height: 50px
      border: 4px solid rgba(0,0,0,0)
      animation: rotate 1s linear infinite

  @keyframes rotate
    0%
      transform: rotate(0deg)
    100%
      transform: rotate(360deg)
</style>
