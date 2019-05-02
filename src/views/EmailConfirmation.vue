<template>
  <v-flex>
    <v-layout v-if="confirmationSucceeded">
      Thank you for confirming your email!
    </v-layout>
    <v-layout v-else-if="alreadyConfirmed">
      This email has already been confirmed
    </v-layout>
    <v-layout v-else-if="!!error">
      {{error}}
    </v-layout>
    <v-layout v-else>
      Confirming email...
    </v-layout>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import {adminInst} from '../services/http/AxiosInstance'
  import { uriTemplate } from '../services/http/WebUtils'
  import StorageService from '../services/StorageService'

  const confirmationCacheKey = 'user-confirmed'
  export default Vue.extend({
    name: 'EmailConfirmation',
    data () {
      return {
        alreadyConfirmed: false,
        confirmationSucceeded: false,
        error: null
      }
    },
    async created () {
      this.alreadyConfirmed = StorageService.get(confirmationCacheKey) === this.$route.params.key
      if (this.alreadyConfirmed) return
      try {
        const res = await adminInst.post(uriTemplate(`demo/confirm/{key}`, [this.$route.params.key]))
        if (res.status < 300) {
          StorageService.set(confirmationCacheKey, this.$route.params.key)
          this.alreadyConfirmed = true
          this.confirmationSucceeded = true
        }
      } catch (err) {
        if (err && err.response && err.response.data && err.response.data.msg) {
          this.error = err.response.data.msg
        } else {
          this.error = err.message
        }
      }
    }
  })
</script>
