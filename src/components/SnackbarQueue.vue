<template>
    <div>
      <v-snackbar
        :value="isVisible"
        :timeout="0"
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
      </v-snackbar>
    </div>
</template>

<script lang="ts">
  import merge from 'lodash/merge'
  import Vue, {Component} from "vue"

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
    color: undefined,
    multiLine: false,
    vertical: false,
    bottom: true,
    absolute: true
  }

  let vm = null
  let data = {
    queue: [] as SnackConfig[],
    snack: {} as SnackConfig,
    isVisible: false,
    isClosing: false,
    showClose: false,
    timeoutId: null
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
      nextOrDone () {
        if (!!this.queue.length && !this.isClosing && !this.isVisible) {
          this.snack = this.queue.shift() || {}
          this.isVisible = true
          this.showClose = false
          if (!!this.snack.timeout) {
            this.timeoutId = setTimeout(() => {
              this.next()
            }, this.snack.timeout)
          } else {
            this.showClose = true
          }
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
          this.snack = {}
          this.timeoutId = null
          this.nextOrDone()
        }, 300)
      }
    }
  })
</script>

<style scoped>

</style>
