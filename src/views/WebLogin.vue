<template>
  <v-container class="web-login">
    <v-row class="justify-space-around">
      <v-col cols="6" xs="6">
        <h2>
          {{ $t('login') }}
        </h2>
      </v-col>
    </v-row>
    <v-row class="justify-space-around">
      <v-col cols="10" sm="8" md="6">
        <LoginForm
          :clearCredentials="false"
          :isWorking="isWorking"
          @login="login"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import LoginService from '../services/login'
  import LoginForm from '../components/login/LoginForm.vue'
  import { routeQueue } from '../router'

  export default {
    name: 'web-login',
    components: { LoginForm },
    head: {
      title: {
        inner: 'Login'
      }
    },
    data () {
      return {
        isWorking: false
      }
    },
    methods: {
      async login (username, password) {
        try {
          this.isWorking = true
          await LoginService.login(username, password)
          // await UserService.loadCurrentUser()
          routeQueue.goToNext()
        } catch (err) {
          if (err.response && err.response.status && err.response.status === 403) {
            this.alert('error', 'Invalid username or password')
          } else {
            this.log(err)
            this.alert('error', err.message, {timeout: 0})
          }
        } finally {
          this.isWorking = false
        }
      }
    }
  }
</script>

<style lang="sass" scoped>
  h2
    margin-top: 30px
    text-align: center
</style>
