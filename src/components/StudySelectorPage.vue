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
  import index from '../router/index'
  import StudySelector from './StudySelector'
  export default {
    name: 'study-selector-page',
    methods: {
      done: function () {
        if (this.$route.query.to) {
          index.push({path: this.$route.query.to})
        } else {
          index.push({name: 'Home'})
        }
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

<style scoped>

</style>
