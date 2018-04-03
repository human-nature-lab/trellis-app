<template>
  <div class="home">
    <Login></Login>
    <Sync v-if="isCordova"></Sync>
  </div>
</template>

<script>
  import Sync from './sync/Sync.vue'
  import Login from './login/Login.vue'
  import Config from '../config'
  export default {
    name: 'home',
    computed: {
      isCordova: function () {
        return Config.cordova
      }
    },
    components: {
      Sync,
      Login
    }
  }
</script>

<style scoped>

</style>
