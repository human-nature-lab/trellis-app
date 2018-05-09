<template>
    <v-card>
      <h2>Choose a locale</h2>
      <LocaleSelector @change="onChange"/>
      <v-btn @click="done">Done</v-btn>
    </v-card>
</template>

<script>
  import LocaleSelector from './LocaleSelector'
  import router from '../router/router'
  export default {
    name: 'locale-selector',
    methods: {
      done: function () {
        if (this.$route.query.to) {
          router.push({path: this.$route.query.to})
        } else {
          router.push({name: 'home'})
        }
      },
      onChange: function () {}
    },
    components: {
      LocaleSelector
    }
  }
</script>

<style scoped>

</style>
