<template>
  <v-flex>
    <v-card flat>
      <v-card-title>
        <h3>{{ title }}</h3>
      </v-card-title>
      <v-card-text class="sync-step-text">
        <slot></slot>
      </v-card-text>
    </v-card>
    <auto-click-button
      v-bind:button-status="continueStatus"
      v-on:button-clicked="onClick"
      v-on:cancel-clicked="onCancel">
      {{ (continueStatus === 3) ? $t('done') : $t('continue') }}
    </auto-click-button>
  </v-flex>
</template>

<script>
  import AutoClickButton from '../AutoClickButton.vue'
  export default {
    name: 'sync-step',
    data () {
      return {}
    },
    created () {
    },
    props: {
      title: String,
      continueStatus: Number
    },
    methods: {
      onClick: function () {
        this.$emit('continue-clicked')
      },
      onCancel: function () {
        this.$emit('cancel-clicked')
      }
    },
    computed: {},
    components: {
      AutoClickButton
    }
  }
</script>

<style lang="sass">
  .sync-step-text li
    margin-left: 1em
</style>
