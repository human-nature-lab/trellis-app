<template>
  <v-container class="web-login">
    <v-layout justify-space-around>
      <v-flex xs6>
        <h2>Login</h2>
      </v-flex>
    </v-layout>
    <v-layout justify-space-around>
      <v-alert v-show="error">
        {{error}}
      </v-alert>
    </v-layout>
    <v-layout justify-space-around>
      <v-flex xs8>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit="login()">
          <v-text-field
            name="username"
            label="Username"
            :rules="rules.username"
            required
            v-model="username" />
          <v-text-field
            label="Password"
            required
            :rules="rules.password"
            :append-icon="e1 ? 'visibility' : 'visibility_off'"
            :append-icon-cb="() => (e1 = !e1)"
            :type="e1 ? 'password' : 'text'"
            v-model="password"/>
          <v-btn
            @click="login()"
            :disabled="!valid">
            Login
          </v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import LoginService from '../../services/login/LoginService'
  import router from '../../router/router'
  export default {
    name: 'web-login',
    data: function () {
      return {
        username: null,
        password: null,
        e1: true,
        error: null,
        valid: false,
        rules: {
          username: [
            v => !!v || 'Username is required'
          ],
          password: [
            v => !!v || 'Password is required'
          ]
        }
      }
    },
    methods: {
      login: function () {
        if (!this.$refs.form.validate()) return
        let params = {
          form: this.$route.query.form
        }
        LoginService.login(this.username, this.password, params).then(res => {
          if (this.$route.query.to) {
            router.push({path: this.$route.query.to})
          } else {
            router.push({name: 'home'})
          }
        }).catch(err => {
          this.error = 'Unable to login with these credentials'
          console.error('Login error:')
          console.error(err)
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
