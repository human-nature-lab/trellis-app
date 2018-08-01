<template>
  <v-alert
    :value="show"
    :type="type"
    @click="toggleShow"
    outline>
    <v-layout row wrap>
      <v-flex :xs11="isMore()">
        {{ getMessage() }}
        <slot></slot>
      </v-flex>
      <v-flex xs1>
        <v-icon v-if="isMore()">{{ (showMore) ? 'expand_less' : 'expand_more' }}</v-icon>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="showMore">
      <v-flex xs12>
        <div class="textarea-wrapper">
          <textarea
            ref="textarea"
            readonly
            rows="10"
            @click.stop="selectAll">{{ messageObject() }}</textarea>
        </div>
      </v-flex>
    </v-layout>
  </v-alert>
</template>

<script>
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
      message: {
        required: false,
        type: [Object, String, Error]
      },
      show: {
        required: false,
        'default': true,
        type: Boolean
      },
      type: {
        required: false,
        'default': 'error',
        type: String
      }
    },
    methods: {
      getMessage: function () {
        if (!this.message) {
          return ''
        }
        if ((this.message instanceof Object || this.message instanceof Error) &&
          (this.message.hasOwnProperty('message') || this.message.hasOwnProperty('msg'))) {
          return (this.message.hasOwnProperty('message')) ? this.message.message : this.message.msg
        }
        if (typeof this.message === 'string' || this.message instanceof String) {
          return this.message
        }
      },
      messageObject: function () {
        if (this.message instanceof Object || this.message instanceof Error) return this.message
        return {}
      },
      toggleShow: function () {
        if (this.isMore()) {
          this.showMore = !this.showMore
        }
      },
      isMore: function () {
        return (Object.keys(this.messageObject()).length > 0)
      },
      selectAll: function (event) {
        this.$refs.textarea.select()
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
