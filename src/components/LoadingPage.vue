<template>
    <v-container :class="['loading-container', {'hidden': !showLoading}]">
      <v-layout>
        <h2>
          {{currentMessage}}
        </h2>
      </v-layout>
      <v-layout>
        <v-progress-linear
          v-model="progress" />
      </v-layout>
    </v-container>
</template>

<script>
  const preloadTime = 750 // Used to prevent unwanted flashing of the screen on fast/local internet connections
  export default {
    name: 'loading-bar',
    props: {
      message: {
        type: String
      },
      messages: {},
      step: {
        type: Number
      },
      maxSteps: {
        type: Number
      }
    },
    data: function () {
      return {
        showLoading: false,
        timeout_: null
      }
    },
    created: function () {
      this.timeout_ = setTimeout(() => {
        this.showLoading = true
      }, preloadTime)
    },
    beforeDestroy: function () {
      clearTimeout(this.timeout_)
    },
    computed: {
      currentMessage: function () {
        return this.message || this.messages[this.progress] || ''
      },
      progress: {
        get: function () {
          return 100 * this.step / this.maxSteps
        },
        set: function () {}
      }
    }
  }
</script>

<style lang="sass" scoped>
.loading-container
  transition: opacity .3s
  opacity: 1
  overflow: hidden
.hidden
  opacity: 0
</style>
