<template>
  <v-toolbar
    flat
    color="primary"
    class="white--text">
    <v-toolbar-title>
      <slot>
        {{title}}
      </slot>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn
      icon
      class="white--text"
      @click="$emit('close')">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    props: {
      title: {
        type: String
      }
    },
    name: 'ModalTitle'
  })
</script>

<style scoped>

</style>
