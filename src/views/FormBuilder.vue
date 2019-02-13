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
  import {Route} from 'vue-router/types/router'
  import {getToken} from '../services/http/AxiosInstance'
  import global from '../static/singleton'
  export default Vue.extend({
    name: 'FormBuilder',
    data () {
      return {
        global,
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
        const url = this.formBuilderUrl.replace('{form_id}', this.formId)
          .replace('{token}', JSON.stringify(getToken()))
          .replace('{study}', JSON.stringify(this.global.study.toSnakeJSON(true)))
          .replace('{locale}', JSON.stringify(this.global.locale.toSnakeJSON(true)))
        return encodeURI(url)
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
