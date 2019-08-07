<template>
  <v-container fluid>
    <v-layout column>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('select_language') }}
          </v-toolbar-title>
        </v-toolbar>
        <v-container fluid>
         <LocaleSelector @change="done"/>
        </v-container>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
  import LocaleSelector from '../components/LocaleSelector'
  import index from '../router/index'
  export default {
    name: 'locale-selector',
    methods: {
      done: function () {
        if (this.$route.query.to) {
          let path = this.$route.query.to.replace(/locale=[^&?]*/g, '')
          index.push({path: path})
        } else {
          index.push({name: 'Home'})
        }
      }
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
