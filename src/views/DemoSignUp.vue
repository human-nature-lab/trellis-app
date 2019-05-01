<template>
  <v-layout justify-space-around>
    <v-flex md6 xs12>
      <v-form ref="form" v-model="formValid">
        <h1>Sign up for a demo of Trellis</h1>
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
              :rules="emailRules"
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
              :ryles="[required(), minLength(5)]"
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
        user: {
          name: '',
          email: '',
          username: '',
          password: ''
        },
        working: false,
        formValid: false,
        submitted: false,
        emailRules: [this.required(), this.email()]
      }
    },
    methods: {
      async signup () {
        if (this.isValid) {
          this.working = true
          try {
            const res = await adminInst.post('demo/create-user', {
              name: this.user.name,
              email: this.user.email,
              username: this.user.username,
              password: this.user.password
            })
            this.alert('success', 'Successfully submitted the signup form!', {timeout: 0})
            this.submitted = true
            setTimeout(() => {
              router.replace({name: 'Login'})
            }, 2000)
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
        return this.formValid && this.$refs.form.validate()
      }
    }
  })
</script>
