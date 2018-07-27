<template>
  <v-alert
    :value="show"
    color="error"
    icon="warning"
    @click="toggleShow"
    outline>
    <v-layout row wrap>
      <v-flex :xs11="showMore()">
        {{ errorMessage() }}
      </v-flex>
      <v-flex xs1>
        <v-icon v-if="showMore()">expand_more</v-icon>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="showError">
      <textarea>{{ errorObject() }}</textarea>
    </v-layout>
  </v-alert>
</template>

<script>
  /**
   * A component for displaying caught errors in a friendly format with the
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
        this.showError = !this.showError
      },
      showMore: function () {
        return (Object.keys(this.errorObject).length > 0)
      }
    },
    computed: {
    },
    components: {
    }
  }
</script>
