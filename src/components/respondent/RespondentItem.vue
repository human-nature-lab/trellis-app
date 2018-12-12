<template>
  <v-flex xs6 sm6 md4 lg3 xl2>
    <v-card
      :ripple="{class: 'primary--text'}"
      :raised="selected === true"
      tile
      :class="{selected: selected === true, respondent: true, 'ma-1': true}">
      <v-card-media class="respondent-photo"
                    @click="onClick">
        <Photo
          :photo="photo"
          width="150"
          height="150" />
      </v-card-media>
      <v-card-actions class="respondent-name">
        <v-flex>
          {{name}}
        </v-flex>
        <v-spacer />
        <v-btn
          @click="showFullscreen = true"
          icon>
          <v-icon :large="$vuetify.breakpoint.smAndDown">fullscreen</v-icon>
        </v-btn>
      </v-card-actions>
      <v-card-text v-if="labels && labels.length">
        <v-chip
          label
          outline
          v-for="label in labels">
          {{label}}
        </v-chip>
      </v-card-text>
    </v-card>
    <FullscreenPhoto
      :title="name"
      v-model="showFullscreen"
      :photo="photo" />
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Photo from '../photo/Photo'
  // @ts-ignore
  import FullscreenPhoto from '../photo/FullscreenPhoto'
  import Respondent from '../../entities/trellis/Respondent'
  import Vue from 'vue'
  import {TranslateResult} from "vue-i18n"
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
      },
      labels: {
        type: Array
      }
    },
    data () {
      return {
        showInfo: false,
        showFullscreen: false
      }
    },
    methods: {
      onClick () {
        this.$emit('selected')
      },
      photoFromFile () {},
      photoFromCamera () {},
      cancelLoad () {}
    },
    computed: {
      name (): string {
        let rName = this.respondent.names.find(n => n.isDisplayName)
        return rName ? rName.name : this.respondent.name
      },
      photo (): Photo {
        return this.respondent.photos.length ? this.respondent.photos[0] : null
      }
    },
    components: {
      Photo,
      FullscreenPhoto
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
