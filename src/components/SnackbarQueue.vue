<template>
  <div class="screen-bottom">
    <v-snackbar
      v-model="isVisible"
      :timeout="timeout"
      :color="snack.color"
      :multiLine="snack.multiLine"
      :vertical="snack.vertical"
      :top="snack.top "
      :right="snack.right "
      :bottom="snack.bottom"
      :left="snack.left"
      :absolute="snack.absolute">
      <span v-if="!!snack.msg">{{snack.msg}}</span>
      <v-btn
        v-if="showClose"
        @click="next"
        flat>{{$t('close')}}</v-btn>
      <v-btn
        v-if="showCloseAll"
        @click="closeAll"
        flat>
        {{$t('close_all')}} ({{queue.length}})
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
  import merge from 'lodash/merge'
  import Vue, {Component} from 'vue'

  interface SnackConfig {
    slot?: Component
    msg?: string
    timeout?: number
    autoHeight?: boolean
    color?: string
    multiLine?: boolean
    vertical?: boolean
    bottom?: boolean
    top?: boolean
    left?: boolean
    right?: boolean
    absolute?: boolean
  }

  const defaultConfig: SnackConfig = {
    timeout: 4000,
    autoHeight: false,
    color: null,
    multiLine: false,
    vertical: false,
    bottom: true
    // absolute: true
  }

  let vm = null
  let data = {
    queue: [] as SnackConfig[],
    snack: {} as SnackConfig,
    isVisible: false,
    isClosing: false,
    showClose: false,
    showCloseAll: false,
    timeoutId: null,
    timeout: 0
  }

  export function AddSnack (msgOrSlot: string|Component, config?: SnackConfig) {
    if (!vm) {
      throw new Error('SnackbarQueue component must be mounted before this method can be called!')
    }
    vm.pushQueue(msgOrSlot, config)
  }

  export default Vue.extend({
    name: 'SnackbarQueue',
    data () {
      return data
    },
    mounted () {
      vm = this
    },
    methods: {
      pushQueue (msgOrSlot: string|Component, config?: SnackConfig) {
        config = merge({}, defaultConfig, config)
        if (typeof msgOrSlot === 'string') {
          config.msg = msgOrSlot
        } else {
          config.slot = msgOrSlot
        }
        this.queue.push(config)
        this.nextOrDone()
      },
      clearSnack () {
        this.$set(this, 'snack', defaultConfig)
      },
      nextOrDone () {
        if (!!this.queue.length && !this.isClosing && !this.isVisible) {
          const snack = this.queue.shift()
          if (snack) {
            this.snack = snack
          } else {
            this.clearSnack()
          }
          this.isVisible = true
          this.showClose = false
          if (!!this.snack.timeout) {
            this.timeoutId = setTimeout(() => {
              this.next()
            }, this.snack.timeout)
          } else {
            this.showClose = true
          }
          this.showCloseAll = this.queue.length >= 3
        }
      },
      next () {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId)
          this.timeoutId = null
        }
        this.isVisible = false
        this.isClosing = true
        this.timeoutId = setTimeout(() => {
          this.isClosing = false
          this.clearSnack()
          this.timeoutId = null
          this.nextOrDone()
        }, 300)
      },
      closeAll () {
        this.queue = []
        this.next()
      }
    }
  })
</script>

<style lang="sass" scoped>
  .screen-bottom
    position: fixed
    bottom: 0
    z-index: 10000
</style>
