<template>
  <v-dialog
    fullscreen
    lazy
    :hide-overlay="false"
    :value="value"
    @input="$emit('input', $event)">
    <!--<ModalTitle title="" @close="isFullOpen = false"/>-->
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
  import Photo from './Photo'
  export default {
    components: {Photo},
    props: {
      value: {
        type: Boolean,
        required: true
      },
      photo: {
        type: Object,
        required: true
      }
    },
    name: 'FullscreenPhoto'
  }
</script>

<style scoped>

</style>
