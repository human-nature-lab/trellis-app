<template>
  <v-list>
    <v-list-tile avatar
                 v-for="respondent in respondents"
                 :key="respondent.id"
                 @click="onClick(respondent)">
      <v-list-tile-avatar>
        <Photo :photo="respondent.photo[0]"></Photo>
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
  import Photo from './Photo'
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
        console.log('TODO: Show more information on the respondent. Locations, names, respondent condition tags, etc.')
      },
      onClick: function (respondent) {
        this.$emit('respondentsSelected', [respondent])
      }
    },
    components: {
      Photo
    }
  }
</script>

<style scoped>

</style>
