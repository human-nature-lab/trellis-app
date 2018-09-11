<template>
  <v-container class="web-login">
    <v-layout justify-space-around>
      <v-flex xs6>
        <h2>
          {{ $t('login') }}
        </h2>
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
            :label="$t('username')"
            autocapitalize="off"
            autocorrect="off"
            :rules="rules.username"
            required
            autofocus
            @keyup.enter="login()"
            v-model="username" />
          <v-text-field
            :label="$t('password')"
            autocapitalize="off"
            autocorrect="off"
            required
            :rules="rules.password"
            @keyup.enter="login()"
            :append-icon="e1 ? 'visibility' : 'visibility_off'"
            :append-icon-cb="() => (e1 = !e1)"
            :type="e1 ? 'password' : 'text'"
            v-model="password"/>
          <v-alert :value="showError()">{{ errorMessage }}</v-alert>
          <v-btn
            @click="login()"
            :disabled="!valid">
            {{ $t('login') }}
          </v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import LoginService from '../../services/login'
  import UserService from '../../services/user/UserService'
  import router from '../../router'

  export default {
    name: 'web-login',
    head: {
      title: {
        inner: 'Login'
      }
    },
    data: function () {
      return {
        errorMessage: undefined,
        username: 'admin',
        password: '***REMOVED***',
        e1: true,
        error: null,
        valid: false,
        rules: {
          username: [
            v => !!v || this.$t('required_field')
          ],
          password: [
            v => !!v || this.$t('required_field')
          ]
        }
      }
    },
    methods: {
      login: async function () {
        this.errorMessage = undefined
        if (!this.$refs.form.validate()) return
        let params = {
          form: this.$route.query.form
        }
        try {
          await LoginService.login(this.username, this.password, params)
          await UserService.loadCurrentUser()
          if (this.$route.query.to) {
            router.push({path: this.$route.query.to})
          } else {
            router.push({name: 'Home'})
          }
        } catch (err) {
          console.error(err)
          this.errorMessage = err.message
        }
      },
      showError: function () {
        return (this.errorMessage !== undefined)
      }
    }
  }
</script>

<style lang="sass" scoped>
  h2
    margin-top: 30px
    text-align: center
</style>
