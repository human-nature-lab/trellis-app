<template>
  <v-flex xs12>
    <v-stepper v-model="step" vertical>
      <v-stepper-step :complete="step > 1" step="1">
        Confirming
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-layout class="ma-5">
          <v-flex>
            Confirming email and provisioning resources
          </v-flex>
          <TrellisLoadingCircle size="25px" />
        </v-layout>
      </v-stepper-content>
      <v-stepper-step :complete="step > 2" step="2">
        Confirmed
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-layout class="ma-5">
          <v-flex v-if="confirmationSucceeded">
            Thank you for confirming your email! Please <router-link :to="{name: 'Login'}">login</router-link> to continue.
          </v-flex>
          <v-flex v-else-if="alreadyConfirmed">
            This email has already been confirmed! Please <router-link :to="{name: 'Login'}">login</router-link> to continue.
          </v-flex>
          <v-alert :value="!!error" color="error">
            {{error}}
          </v-alert>
        </v-layout>
      </v-stepper-content>
    </v-stepper>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisLoadingCircle from '../components/TrellisLoadingCircle.vue'
  import {adminInst} from '../services/http/AxiosInstance'
  import { uriTemplate } from '../services/http/WebUtils'
  import StorageService from '../services/StorageService'

  const confirmationCacheKey = 'user-confirmed'
  export default Vue.extend({
    name: 'EmailConfirmation',
    components: { TrellisLoadingCircle },
    data () {
      return {
        step: 1,
        alreadyConfirmed: false,
        confirmationSucceeded: false,
        error: null
      }
    },
    async created () {
      this.alreadyConfirmed = StorageService.get(confirmationCacheKey) === this.$route.params.key
      if (this.alreadyConfirmed) {
        this.step++
        return
      }
      try {
        const res = await adminInst.post(uriTemplate(`demo/confirm/{key}`, [this.$route.params.key]))
        if (res.status < 300) {
          StorageService.set(confirmationCacheKey, this.$route.params.key)
          this.alreadyConfirmed = true
          this.confirmationSucceeded = true
          this.step++
        }
      } catch (err) {
        this.step++
        if (err && err.response && err.response.data && err.response.data.msg) {
          this.error = err.response.data.msg
        } else {
          this.error = err.message
        }
      }
    }
  })
</script>
