<template>
  <v-layout justify-space-around>
    <v-flex md6 xs12>
      <v-form ref="form" v-model="formValid">
        <h1>Sign up for a demo of Trellis</h1>
        <v-layout column>
          <v-flex>
            <v-text-field
              required
              :label="$t('email')"
              v-model="email" />
          </v-flex>
          <v-flex>
            <v-text-field
              required
              :label="$t('username')"
              v-model="username" />
          </v-flex>
          <v-flex>
            <v-text-field
              required
              :label="$t('password')"
              v-model="password" />
          </v-flex>
          <v-flex>
            <v-btn
              @click="signup"
              :disabled="!isValid || working">
              <TrellisLoadingCircle
                v-if="working"
                size="25px" />
              <span v-else>{{$t('sign_up')}}</span>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { adminInst } from '../services/http/AxiosInstance'

  export default Vue.extend({
    name: 'DemoSignUp',
    data () {
      return {
        email: '',
        username: '',
        password: '',
        working: false,
        formValid: false,
        submitted: false
      }
    },
    methods: {
      async signup () {
        if (this.isValid) {
          this.working = true
          try {
            const res = await adminInst.post('demo/create-user', {
              email: this.email,
              username: this.username,
              password: this.password
            })
            this.alert('success', 'Successfully submitted the signup form!')
            this.submitted = true
          } catch (err) {
            this.log(err)
            if (err.response && err.response.data && err.response.data.msg) {
              this.alert('error', err.response.data.msg, {timeout: 0})
            } else {
              this.alert('error', 'Unable to submit the signup form.', {timeout: 0})
            }
          } finally {
            this.working = false
          }
        }
      }
    },
    computed: {
      isValid (): boolean {
        return this.formValid && this.$refs.form.validate()
      }
    }
  })
</script>
