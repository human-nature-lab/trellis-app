<template>
  <v-list>
    <v-list-tile avatar v-for="respondent in respondents" :key="respondent.id">
      <v-list-tile-avatar>
        <img :src="respondent.photos[0].src" :alt="respondent.name">
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{respondent.name}}</v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn flat @click="showMore(respondent)">
          <v-icon color="blue darken-3">info</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
  export default {
    name: 'respondents-view',
    props: {
      respondents: {
        type: Array,
        required: true
      }
    },
    methods: {
      showMore: function (respondent) {
        console.log(respondent)
      }
    }
  }
</script>

<style scoped>

</style>
