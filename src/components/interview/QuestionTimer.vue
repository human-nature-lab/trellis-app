<template>
  <v-layout row>
    <v-flex class="container">
      <v-progress-linear height="20" color="accent" :value="timer.progress * 100"/>
      <div class="center" :style="{color: timer.elapsed > timer.duration / 2 ? 'white' : 'black'}">{{Math.abs(timer.duration - timer.elapsed) / 1000 | toFixed(0)}}</div>
    </v-flex>
    <v-btn
      v-if="showControls"
      color="primary"
      :disabled="timer.hasExpired"
      @click="toggleState">
      <v-icon v-if="timer.isRunning">mdi-pause</v-icon>
      <v-icon v-else>mdi-play</v-icon>
    </v-btn>
    <v-btn
      v-if="showControls"
      color="primary"
      @click="reset">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Timer from '../../classes/Timer'
  export default Vue.extend({
    name: 'QuestionTimer',
    props: {
      duration: {
        type: Number,
        default: 30
      },
      showControls: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        timer: new Timer(this.duration * 1000, 1000)
      }
    },
    beforeDestroy () {
      this.timer.stop()
    },
    methods: {
      reset () {
        this.timer.reset()
      },
      toggleState () {
        if (this.timer.isRunning) {
          this.timer.stop()
        } else {
          this.timer.start()
        }
      }
    }
  })
</script>

<style lang="sass" scoped>
  $size: 20px
  .container
    margin: 0 1rem
    padding: 0
    position: relative
    > *
      position: absolute
      top: 0
    .center
      z-index: 10
      margin: 1rem
      height: $size
      line-height: $size
      width: 100%
      text-align: center
</style>
