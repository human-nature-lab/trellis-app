<template>
    <v-container>
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

<style scoped>

</style>
