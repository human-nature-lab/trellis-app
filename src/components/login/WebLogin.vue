<template>
  <v-container class="web-login">
    <v-layout justify-space-around>
      <v-flex xs6>
        <h2>Login</h2>
      </v-flex>
    </v-layout>
    <v-layout justify-space-around v-if="error">
      <v-flex xs8>
        {{error}}
      </v-flex>
    </v-layout>
    <v-layout justify-space-around>
      <v-flex xs8>
        <v-text-field
          name="username"
          label="Username"
          v-model="username" />
        <v-text-field
          label="Password"
          :append-icon="e1 ? 'visibility' : 'visibility_off'"
          :append-icon-cb="() => (e1 = !e1)"
          :type="e1 ? 'password' : 'text'"
          v-model="password"/>
        <v-btn @click="login()">
          Login
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import http from '@/services/http/AxiosInstance'
  export default {
    name: 'web-login',
    data: function () {
      return {
        username: null,
        password: null,
        e1: true,
        error: null
      }
    },
    computed: {
      formId: 'stuff'
    },
    methods: {
      login: function () {
        http().post(`survey-view/form/${this.formId}/login`, {
          username: this.username,
          password: this.password
        }).then(res => {
          if (res.status >= 200 && res.status < 400) {

          } else {
            throw Error('Unable to log in to this form with the provided credentials')
          }
        }).catch(err => {
          this.error = err
        })
      }
    }
  }
</script>

<style lang="sass" scoped>
  h2
    margin-top: 30px
    text-align: center
</style>
