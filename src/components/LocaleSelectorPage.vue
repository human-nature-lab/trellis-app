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
          let path = this.$route.query.to.replace(/locale=[^&?]*/g, '')
          router.push({path: path})
        } else {
          router.push({name: 'home'})
        }
      },
      onChange: function () {}
    },
    head: {
      title: {
        inner: 'Locale Selector'
      }
    },
    components: {
      LocaleSelector
    }
  }
</script>

<style scoped>

</style>
