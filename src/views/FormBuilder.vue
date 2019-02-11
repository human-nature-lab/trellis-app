<template>
  <v-flex>
    <iframe
      :src="iframeSrc"
      frameborder="0" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import config from '../config'
  import {Route} from "vue-router/types/router"
  export default Vue.extend({
    name: 'FormBuilder',
    data () {
      return {
        formId: this.$route.params.formId,
        formBuilderUrl: config.formBuilderUrl
      }
    },
    beforeRouteUpdate (to: Route, from: Route, next) {
      this.formId = to.params.formId
      next()
    },
    computed: {
      iframeSrc (): string {
        return this.formBuilderUrl.replace('{form_id}', this.formId)
      }
    }
  })
</script>

<style lang="sass" scoped>
  div
    height: 100%
  iframe
    height: 99%
    width: 100%
</style>
