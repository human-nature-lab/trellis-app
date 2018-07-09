<template>
  <v-flex>
    <v-btn
      color="primary"
      @click="onClick"
      v-bind:disabled="buttonStatus === STATUS.DISABLED">
      <slot></slot>&nbsp;<span v-if="isCountingDown"> {{ continueIn }}</span>
    </v-btn>
    <v-btn
      flat
      @click="onCancel">
      Cancel
    </v-btn>
  </v-flex>
</template>

<script>
  import { BUTTON_STATUS } from '../static/constants'
  export default {
    name: 'auto-click-button',
    data: function () {
      return {
        STATUS: BUTTON_STATUS,
        timeRemaining: 3,
        countingDown: false
      }
    },
    props: {
      buttonStatus: {
        type: Number,
        required: true
      }
    },
    mounted: function () {
    },
    methods: {
      onClick: function () {
        this.$emit('button-clicked')
      },
      onCancel: function () {
        this.countingDown = false
        this.$emit('cancel-clicked')
      },
      countDown: function () {
        if (!this.countingDown) return
        setTimeout(() => {
          this.timeRemaining--
          if (this.timeRemaining > 0) {
            this.countDown()
          } else {
            if (this.countingDown) {
              this.countingDown = false
              this.timeRemaining = 3
              this.onClick()
            }
          }
        }, 1000)
      }
    },
    computed: {
      continueIn: function () {
        return this.timeRemaining
      },
      isCountingDown () {
        if (this.buttonStatus === this.STATUS.AUTO_CONTINUE && !this.countingDown) {
          this.countingDown = true
          this.countDown()
          return true
        }
        return this.countingDown
      }
    },
    components: {
    },
    watch: {
    }
  }
</script>

<style lang="sass" scoped>
</style>
