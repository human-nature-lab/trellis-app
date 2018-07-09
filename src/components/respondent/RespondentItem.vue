<template>
  <v-flex xs12 sm6 md4 lg3 xl2>
    <v-card
      :raised="selected === true"
      tile
      :class="{selected: selected === true, respondent: true}">
      <v-card-media class="respondent-photo"
                    @click="onClick()">
        <Photo :photo="respondent.photos[0]" width="150" height="150"></Photo>
      </v-card-media>
      <v-card-text class="respondent-name"
                   @click="onClick()">
        {{name}}
        <!--<v-btn @click="onClick">Select</v-btn>-->
      </v-card-text>
      <v-card-actions>
        <v-btn
          icon
          v-if="formsButtonVisible"
          :to="{name: 'respondent-forms', params: {studyId: global.study.id, respondentId: respondent.id}}">
          <v-icon>assignment</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          icon
          v-if="infoButtonVisible"
          :to="{name: 'Respondent', params: {studyId: global.study.id, respondentId: respondent.id}}">
          <v-icon>info</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
  import Photo from '../Photo'
  import RespondentInfo from './RespondentInfo'
  export default {
    name: 'respondent-item',
    props: {
      formsButtonVisible: {
        type: Boolean,
        default: true
      },
      infoButtonVisible: {
        type: Boolean,
        default: true
      },
      respondent: {
        type: Object,
        required: true
      },
      selected: {
        type: Boolean
      }
    },
    data: function () {
      return {
        showInfo: false
      }
    },
    methods: {
      onClick: function () {
        this.$emit('selected')
      },
      photoFromFile: function () {

      },
      photoFromCamera: function () {

      }
    },
    computed: {
      name () {
        let rName = this.respondent.names.find(n => n.is_display_name)
        return rName ? rName.name : this.respondent.name
      }
    },
    components: {
      Photo,
      RespondentInfo
    }
  }
</script>

<style lang="sass">
  .respondent
    cursor: pointer
    &.selected
      background-color: orangered
      color: white
      margin: 2px
      box-shadow: 2px 2px 5px orangered
    .respondent-photo
      img
        max-width: 100%
        max-height: 100%
        pointer-events: none
</style>
