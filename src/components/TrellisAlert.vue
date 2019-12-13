<template>
  <v-alert
    :value="show"
    :type="getType()"
    @click="toggleShow"
    outline>
    <v-layout row wrap>
      <v-flex :xs11="isMore">
        {{ getMessage() }}
        <slot></slot>
      </v-flex>
      <v-flex xs1>
        <v-icon v-if="isMore">{{ (showMore) ? 'expand_less' : 'expand_more' }}</v-icon>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="showMore">
      <v-flex xs12>
        <div class="textarea-wrapper">
          <textarea
            ref="textarea"
            readonly
            rows="10"
            :value="getFullMessage()"
            @click.stop="selectAll"></textarea>
        </div>
      </v-flex>
    </v-layout>
  </v-alert>
</template>

<script>
  import Log from '../entities/trellis-config/Log'
  /**
   * A component for displaying info/errors/warnings in a friendly format with the
   * ability to view the full error and perhaps copy or share the error message
   */
  export default {
    name: 'trellis-alert',
    data () {
      return {
        showMore: false
      }
    },
    props: {
      currentLog: {
        required: true,
        validator: (value) => { return (value === undefined || value instanceof Log) }
      },
      show: {
        required: false,
        'default': true,
        type: Boolean
      }
    },
    methods: {
      getMessage () {
        if (this.currentLog instanceof Log) {
          return this.currentLog.message
        }
        return ''
      },
      getFullMessage () {
        if (this.currentLog instanceof Log) {
          if (typeof this.currentLog.fullMessage === 'string') {
            return this.currentLog.fullMessage.replace(/\\n/g, '\n')
          }
          return this.currentLog.fullMessage
        }
        return ''
      },
      getSeverity () {
        if (this.currentLog instanceof Log) {
          return this.currentLog.severity
        }
        return ''
      },
      toggleShow () {
        if (this.isMore) {
          this.showMore = !this.showMore
        }
      },
      selectAll (event) {
        this.$refs.textarea.select()
      },
      getType () {
        const curSeverity = this.getSeverity()
        if (curSeverity === 'error') {
          return 'error'
        }
        if (curSeverity === 'warn') {
          return 'warning'
        }
        return 'info'
      }
    },
    computed: {
      isMore: function () {
        return (this.currentLog instanceof Log && this.currentLog.fullMessage !== null)
      }
    },
    components: {
    }
  }
</script>

<style lang="sass" scoped>
  .warning--text
    color: #ffc107 !important
  .textarea-wrapper
    flex: 0 0 100%
  .textarea-wrapper > textarea
    width: 100%
    border: 1px solid #dd2c00
    overflow: scroll
</style>
