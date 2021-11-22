<template>
  <file-upload
    class="v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default primary"
    v-bind="$attrs"
    v-on="$listeners">
    <span class="v-btn__content">
      <slot />
    </span>
  </file-upload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import FileUpload from 'vue-upload-component'

  export default Vue.extend({
    name: 'TrellisFileUpload',
    components: { FileUpload },
  })
</script>

<style lang="sass">
  
</style>