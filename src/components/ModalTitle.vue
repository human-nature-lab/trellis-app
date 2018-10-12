<template>
  <v-toolbar
    flat
    color="info"
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
      <v-icon>close</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        required: true
      }
    },
    name: 'ModalTitle'
  }
</script>

<style scoped>

</style>
