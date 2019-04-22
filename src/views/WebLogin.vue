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
      <v-flex xs8>
        <LoginForm
          :clearCredentials="false"
          :isWorking="isWorking"
          @login="login"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import LoginService from '../services/login'
  import UserService from '../services/user/UserService'
  import LoginForm from '../components/LoginForm'
  import router from '../router'

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
          await UserService.loadCurrentUser()
          if (this.$route.query.to) {
            router.push({path: this.$route.query.to})
          } else {
            router.push({name: 'Home'})
          }
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
