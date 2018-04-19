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
  import LoginService from '@/services/login/LoginService'
  import {router} from '@/router/router'
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
      studyId: function () {
        return 'a1344f6d-d1d0-4b4c-9cfb-3893f19439ee' // TODO
      },
      formId: function () {
        return '9b2753e8-9f52-4fc9-aefd-c048a48a5bde' // TODO
      }
    },
    methods: {
      login: function () {
        LoginService.login(this.username, this.password, this.formId).then(res => {
          router.push({name: 'Interview', params: {studyId: this.studyId, interviewId: res.data.interviewId}})
        }).catch(() => {
          this.error = 'Unable to login with these credentials'
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
