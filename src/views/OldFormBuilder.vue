<template>
  <v-col class="full-height">
    <TrellisLoadingCircle v-if="isLoading"/>
    <iframe
      ref="iframe"
      v-show="!isLoading"
      :src="iframeSrc"
      frameborder="0" />
  </v-col>
</template>

<script lang="ts">
  import Vue from 'vue'
  import config from 'config'
  import { Route } from 'vue-router'
  import { getToken } from '../services/http/AxiosInstance'
  import TrellisLoadingCircle from '../components/TrellisLoadingCircle.vue'
  import global from '../static/singleton'
  export default Vue.extend({
    name: 'FormBuilder',
    components: { TrellisLoadingCircle },
    data () {
      return {
        global,
        formId: this.$route.params.formId,
        formBuilderUrl: config.formBuilderUrl,
        isLoading: true,
        intervalId: null
      }
    },
    beforeRouteUpdate (to: Route, from: Route, next) {
      this.formId = to.params.formId
      next()
    },
    created () {
      setTimeout(() => {
        this.isLoading = false
      }, 1000)
    },
    mounted () {
      this.intervalId = setInterval(this.resizeIframe, 500)
    },
    beforeDestroy () {
      clearInterval(this.intervalId)
    },
    methods: {
      resizeIframe () {
        const height = this.$refs.iframe.contentWindow.document.body.scrollHeight + 'px'
        this.$refs.iframe.height = height
      }
    },
    computed: {
      iframeSrc (): string {
        const url = this.formBuilderUrl.replace('{form_id}', this.formId)
          .replace('{token}', JSON.stringify(getToken()))
          .replace('{study}', JSON.stringify(this.global.study.toSnakeJSON({includeRelationships: true})))
          .replace('{locale}', JSON.stringify(this.global.locale.toSnakeJSON({includeRelationships: true})))
          .replace('{apiRoot}', JSON.stringify(config.apiRoot))
        return encodeURI(url)
      }
    }
  })
</script>

<style lang="sass" scoped>
  iframe
    min-height: 99%
    width: 100%
  .full-height
    height: 100%
</style>
