<template>
  <v-card
    class="mt-2"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot name="header">
      <v-row
        no-gutters
        class="px-2"
      >
        <v-card-title>{{ title }}</v-card-title>
        <v-spacer />
        <slot name="header-right" />
      </v-row>
    </slot>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-col class="pt-0 pb-1">
      <slot />
    </v-col>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'TCard',
  props: {
    title: String,
    loading: Boolean,
  },
})
</script>

<style lang="sass">

</style>
