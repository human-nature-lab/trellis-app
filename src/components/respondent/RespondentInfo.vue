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
        <v-spacer />
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
            <PhotoAlbum
              v-if="photoMetaData !== null"
              :photo-meta-data="photoMetaData"
              :photos="respondent.photos"
              @photo="onNewPhoto"
              @reorder-photos="onReorderPhotos" />
            <RespondentGeos
              :use-census-form="true"
              :study-id="global.study.id"
              :respondent="respondent" />
            <RespondentConditionTags
              :respondent="respondent"
              :conditionTags="respondentConditionTags" />
            <RespondentNames
              :respondent="respondent" />
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
  import SortedPhoto from "../../types/SortedPhoto"

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
    async created () {
      console.log('respondent.photos', this.respondent.photos)
      this.photoMetaData = await RespondentService.getPhotoMetaData(this.respondent.id)
    },
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
        isAddingPhoto: false,
        photoMetaData: null as object
      }
    },
    methods: {
      async hydrate (respondent: Respondent) {
        console.log('hydrate', respondent)
        console.log('respondent.photos', respondent.photos)
        this.respondent = respondent
        this.respondentConditionTags = await respondent.respondentConditionTags
      },
      leaving () {
        this.respondentConditionTags = []
      },
      async onNewPhoto (photo) {
        await RespondentService.addPhoto(this.respondent.id, photo)
        this.respondent.photos.push(photo)
        this.isAddingPhoto = false
      },
      async onReorderPhotos (photos) {
        console.log('onReorderPhotos', photos)
        let sortedPhotos: SortedPhoto[] = []
        for (let photo of photos) {
          console.log('photo', photo)
          if (photo.hasOwnProperty('id') &&
              photo.hasOwnProperty('sortOrder')) {
            let sortedPhoto = {
              elementId: this.respondent.id,
              sortOrder: photo.sortOrder,
              photoId: photo.id
            }
            sortedPhotos.push(sortedPhoto)
          }
        }
        await RespondentService.orderPhotos(sortedPhotos)
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
