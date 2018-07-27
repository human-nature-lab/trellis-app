<template>
  <v-alert
    :value="show"
    :type="type"
    @click="toggleShow"
    outline>
    <v-layout row wrap>
      <v-flex :xs11="showMore()">
        {{ errorMessage() }}
      </v-flex>
      <v-flex xs1>
        <v-icon v-if="showMore()">{{ (showError) ? 'expand_less' : 'expand_more' }}</v-icon>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="showError">
      <v-flex xs12>
        <div class="textarea-wrapper">
          <textarea
            ref="textarea"
            readonly
            rows="10"
            @click.stop="selectAll">{{ errorObject() }}</textarea>
        </div>
      </v-flex>
    </v-layout>
  </v-alert>
</template>

<script>
  /**
   * A component for displaying caught errors/warnings in a friendly format with the
   * ability to view the full error and perhaps copy or share the error message
   */
  export default {
    name: 'error',
    data () {
      return {
        showError: false
      }
    },
    props: {
      error: {
        required: true,
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
      errorMessage: function () {
        console.log('errorMessage', this.error)
        if ((this.error instanceof Object || this.error instanceof Error) && this.error.hasOwnProperty('message')) {
          return this.error.message
        }
        if (typeof this.error === 'string' || this.error instanceof String) {
          return this.error
        }
      },
      errorObject: function () {
        if (this.error instanceof Object || this.error instanceof Error) return this.error
        return {}
      },
      toggleShow: function () {
        if (this.showMore()) {
          this.showError = !this.showError
        }
      },
      showMore: function () {
        return (Object.keys(this.errorObject()).length > 0)
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
