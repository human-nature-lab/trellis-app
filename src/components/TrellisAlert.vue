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
            @click.stop="selectAll">{{ getFullMessage() }}</textarea>
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
        isMore: false,
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
    created () {
      if (this.currentLog instanceof Log && this.currentLog.fullMessage !== null) {
        this.isMore = true
      }
    },
    methods: {
      getMessage: function () {
        if (this.currentLog instanceof Log) {
          return this.currentLog.message
        }
        return ''
      },
      getFullMessage: function () {
        if (this.currentLog instanceof Log) {
          return this.currentLog.fullMessage
        }
        return ''
      },
      getSeverity: function () {
        if (this.currentLog instanceof Log) {
          return this.currentLog.severity
        }
        return ''
      },
      toggleShow: function () {
        if (this.isMore) {
          this.showMore = !this.showMore
        }
      },
      selectAll: function (event) {
        this.$refs.textarea.select()
      },
      getType: function () {
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
