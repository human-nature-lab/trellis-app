<template>
  <v-layout justify-space-around>
    <v-flex xs12>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1"  step="1">Sign up form</v-stepper-step>
        <v-stepper-content step="1">
          <v-form ref="form" v-model="formValid">
            <v-layout column>
              <v-flex>
                <v-text-field
                  required
                  :rules="[required()]"
                  :label="$t('name')"
                  v-model="user.name"/>
              </v-flex>
              <v-flex>
                <v-text-field
                  required
                  :rules="[required(), email()]"
                  :label="$t('email')"
                  v-model="user.email" />
              </v-flex>
              <v-flex>
                <v-text-field
                  required
                  :rules="[required()]"
                  :label="$t('username')"
                  v-model="user.username" />
              </v-flex>
              <v-flex>
                <v-text-field
                  required
                  :rules="[required(), minLength(5)]"
                  :label="$t('password')"
                  type="password"
                  v-model="user.password" />
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
        </v-stepper-content>
        <v-stepper-step :complete="step > 2" step="2">Confirm Email</v-stepper-step>
        <v-stepper-content step="2">
          <v-layout column>
            <v-flex class="ma-1">Successfully submitting the demo request form. You will receive an email to complete the account creation process soon.</v-flex>
          </v-layout>
        </v-stepper-content>
      </v-stepper>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisLoadingCircle from '../components/TrellisLoadingCircle.vue'
  import ValidationMixin from '../mixins/ValidationMixin'
  import { adminInst } from '../services/http/AxiosInstance'
  import router from '../router'

  export default Vue.extend({
    name: 'DemoSignUp',
    mixins: [ValidationMixin],
    components: { TrellisLoadingCircle },
    data () {
      return {
        step: 1,
        user: {
          name: '',
          email: '',
          username: '',
          password: ''
        },
        working: false,
        formValid: false,
        submitted: false
      }
    },
    methods: {
      async signup () {
        if (this.isValid && this.$refs.form.validate()) {
          this.working = true
          try {
            const res = await adminInst.post('demo/create-user', {
              name: this.user.name,
              email: this.user.email,
              username: this.user.username,
              password: this.user.password
            })
            this.step++
            this.submitted = true
          } catch (err) {
            this.log(err)
            if (err.response && err.response.data && err.response.data.msg) {
              this.alert('error', err.response.data.msg, {timeout: 0})
            } else {
              this.alert('error', err.message, {timeout: 0})
            }
          } finally {
            this.working = false
          }
        }
      }
    },
    computed: {
      isValid (): boolean {
        return this.formValid // && this.$refs.form.validate()
      }
    }
  })
</script>
