<template>
  <v-flex xs12>
    <v-card tile>
      <v-toolbar card prominent>
        <v-toolbar-title>
          {{name}}
          <v-chip
            v-if="respondent.associatedRespondentId"
            label
            color="error"
            outline>({{$t('other_respondent')}})</v-chip>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn :to="{name: 'RespondentForms', params: {studyId: global.study.id, respondentId: respondent.id}}">
          {{ $t('forms') }}
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-container fluid xs12>
          <v-layout column>
            <v-alert v-show="error" type="error">
              {{error}}
            </v-alert>
            <photo-album
              :photos="respondent.photos"
              @photo="onNewPhoto"
              @delete-photo="onDeletePhoto"
              @update-photos="onUpdatePhotos"></photo-album>
            <respondent-geos
              :use-census-form="true"
              :study-id="global.study.id"
              :respondent="respondent"></respondent-geos>
            <respondent-condition-tags
              :respondent="respondent"
              :conditionTags="respondentConditionTags"></respondent-condition-tags>
            <respondent-names
              :respondent="respondent"></respondent-names>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Permission from '../Permission'
  // @ts-ignore
  import RespondentNames from './RespondentNames'
  // @ts-ignore
  import RespondentGeos from './RespondentGeos'
  // @ts-ignore
  import PhotoAlbum from '../photo/PhotoAlbum'
  // @ts-ignore
  import RespondentConditionTags from './RespondentConditionTags'

  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import RespondentService from '../../services/respondent/RespondentService'
  import Respondent from '../../entities/trellis/Respondent'
  import Vue from 'vue'
  import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
  import singleton from '../../static/singleton'
  import RespondentName from "../../entities/trellis/RespondentName"

  /**
   * The respondent info router loader
   * @param {Route} route - A VueRouter route object
   * @returns {Promise<Object>|*}
   */
  function preloadRespondent (route) {
    let respondentId = route.params.respondentId
    return RespondentService.getRespondentById(respondentId)
  }

  export default Vue.extend({
    name: 'respondent-info',
    mixins: [RouteMixinFactory(preloadRespondent, true)],
    data () {
      return {
        global: singleton,
        respondent: null as Respondent,
        respondentConditionTags: [] as RespondentConditionTag[],
        error: null as any,
        deleting: {} as object,
        editing: {
          name: null as string,
          geo: null as string
        },
        modal: {
          editName: false,
          addName: false,
          geoSearch: false,
          conditionTag: false
        },
        isAddingPhoto: false
      }
    },
    methods: {
      hydrate: async function (respondent: Respondent) {
        this.respondent = respondent
        this.respondentConditionTags = await respondent.respondentConditionTags
      },
      leaving: function () {
        this.respondentConditionTags = []
      },
      onNewPhoto: async function (photo) {
        let photoWithPivotTable = await RespondentService.addPhoto(this.respondent.id, photo)
        this.respondent.photos.push(photoWithPivotTable)
        this.isAddingPhoto = false
      },
      onUpdatePhotos: async function (photos) {
        await RespondentService.updatePhotos(photos)
      },
      onDeletePhoto: async function (photo) {
        let confirmMessage = this.$t('remove_photo_confirm') + ''
        if (!window.confirm(confirmMessage)) return
        try {
          await RespondentService.removePhoto(photo)
          this.respondent.photos.splice(this.respondent.photos.indexOf(photo), 1)
        } catch (err) {
          console.error(err)
        }
      }
    },
    computed: {
      name (): string {
        let rName = this.respondent.names.find(n => n.isDisplayName)
        return rName ? rName.name : this.respondent.name
      }
    },
    components: {
      RespondentNames,
      RespondentConditionTags,
      Permission,
      RespondentGeos,
      PhotoAlbum
    }
  })
</script>

<style lang="sass" scoped>
  .table
    td
      &:first-child
        width: 100%
      &:last-child
        white-space: nowrap
  .add-photo
    width: 250px
    height: 250px
    flex-grow: 0
    button
      width: 100%
      height: 100%
</style>
