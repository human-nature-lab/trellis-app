<template>
  <v-card class="mt-4" v-bind="$attrs" v-on="$listeners">
    <slot name="header">
      <v-row no-gutters class="px-2">
        <v-card-title>{{ title }}</v-card-title>
        <v-spacer />
        <slot name="header-right" />
      </v-row>
    </slot>
    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'TCard',
  props: {
    title: String,
  }
})
</script>

<style lang="sass">

</style>