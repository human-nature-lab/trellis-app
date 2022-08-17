<template>
  <div>
    <v-textarea v-if="textarea" v-bind="$attrs" v-on="$listeners">
      <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
    </v-textarea>
    <v-text-field v-else v-bind="$attrs" v-on="$listeners">
      <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
    </v-text-field>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AutoTextField',
  props: {
    textarea: Boolean,
  },
})
</script>

<style lang="sass">

</style>