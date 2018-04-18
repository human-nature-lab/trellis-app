<template>
  <v-flex>
    <p>Login</p>
    <p>{{error}}</p>
  </v-flex>
</template>

<script>
  export default {
    name: 'web-login',
    data: function () {
      return {
        error: 'Unable to login'
      }
    }
  }
</script>

<style scoped>

</style>
