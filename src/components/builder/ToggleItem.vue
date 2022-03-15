<template>
  <v-list-item @click="$emit('input', !value)" v-bind="$attrs" v-on="$listeners">
    <v-list-item-icon>
      <v-icon v-if="value">
        {{onIcon}}
      </v-icon>
      <v-icon v-else>
        {{offIcon}}
      </v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      {{value ? onTitle : (offTitle ? offTitle : onTitle)}}
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    name: 'ToggleItem',
    props: {
      value: Boolean,
      onIcon: {
        type: String,
        default: 'mdi-eye-off'
      },
      offIcon: {
        type: String,
        default: 'mdi-eye',
      },
      onTitle: String,
      offTitle: String,
    }
  })
</script>

<style lang="sass">
  
</style>