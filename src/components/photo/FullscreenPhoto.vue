<template>
  <v-dialog
    fullscreen
    lazy
    :hide-overlay="false"
    :value="value"
    @input="$emit('input', $event)">
    <ModalTitle :title="title" @close="$emit('input', false)"/>
    <v-container
      fluid
      fill-height
      class="full-photo grey lighten-4"
      @click="$emit('input', false)">
      <photo :photo="photo" :isContained="true"></photo>
    </v-container>
  </v-dialog>
</template>

<script>
  import ModalTitle from '../ModalTitle'
  import Photo from './Photo'
  export default {
    components: {Photo, ModalTitle},
    props: {
      value: {
        type: Boolean,
        required: true
      },
      photo: {
        type: Object,
        required: true
      },
      title: {
        type: String
      }
    },
    name: 'FullscreenPhoto'
  }
</script>

<style scoped>

</style>
