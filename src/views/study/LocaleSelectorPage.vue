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
  import LocaleSelector from '@/components/LocaleSelector.vue'
  import { routeQueue } from '@/router'

  export default {
    name: 'LocaleSelectorPage',
    methods: {
      done () {
        routeQueue.goToNext()
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
