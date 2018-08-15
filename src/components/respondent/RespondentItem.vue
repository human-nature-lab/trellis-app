<template>
  <v-flex xs12 sm6 md4 lg3 xl2>
    <v-card
      :raised="selected === true"
      tile
      :class="{selected: selected === true, respondent: true}">
      <v-card-media class="respondent-photo"
                    @click="onClick()">
        <Photo :photo="photo" width="150" height="150"></Photo>
      </v-card-media>
      <v-card-text class="respondent-name"
                   @click="onClick()">
        {{name}}
        <!--<v-btn @click="onClick">Select</v-btn>-->
      </v-card-text>
      <!--<v-card-actions>-->
        <!--<v-btn-->
          <!--icon-->
          <!--v-if="formsButtonVisible"-->
          <!--:to="{name: 'RespondentForms', params: {studyId: global.study.id, respondentId: respondent.id}}">-->
          <!--<v-icon>assignment</v-icon>-->
        <!--</v-btn>-->
        <!--<v-spacer></v-spacer>-->
        <!--<v-btn-->
          <!--icon-->
          <!--v-if="infoButtonVisible"-->
          <!--:to="{name: 'Respondent', params: {studyId: global.study.id, respondentId: respondent.id}}">-->
          <!--<v-icon>info</v-icon>-->
        <!--</v-btn>-->
      <!--</v-card-actions>-->
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Photo from '../Photo'
  import Respondent from '../../entities/trellis/Respondent'
  import Vue from 'vue'
  export default Vue.extend({
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
        type: Respondent,
        required: true
      },
      selected: {
        type: Boolean
      }
    },
    data () {
      return {
        showInfo: false
      }
    },
    methods: {
      onClick () {
        this.$emit('selected')
      },
      photoFromFile () {},
      photoFromCamera () {},
      cancelLoad () {
        this
      }
    },
    computed: {
      name (): string {
        let rName = this.respondent.names.find(n => n.isDisplayName)
        return rName ? rName.name : this.respondent.name
      },
      photo (): Photo {
        return this.respondent.photos.length ? this.respondent.photos[0].photo : null
      }
    },
    components: {
      Photo
    }
  })
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
