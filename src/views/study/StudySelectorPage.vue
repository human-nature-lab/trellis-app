<template>
  <v-container fluid>
    <v-layout column>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('select_study') }}
          </v-toolbar-title>
        </v-toolbar>
        <v-container fluid>
          <StudySelector @change="done"/>
        </v-container>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
  import { routeQueue } from '@/router'
  import StudySelector from '@/components/StudySelector.vue'

  export default {
    name: 'StudySelectorPage',
    methods: {
      done () {
        routeQueue.goToNext()
      }
    },
    head: {
      title: {
        inner: 'Study Selector'
      }
    },
    components: {
      StudySelector
    }
  }
</script>
