<template>
  <v-flex xs12>
    <v-card tile>
      <v-toolbar flat>
        <v-toolbar-title>
          {{name}}
          <v-chip
            v-if="respondent.associatedRespondentId"
            label
            color="error"
            outlined>({{$t('other_respondent')}})</v-chip>
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
              :loading="respondentPhotosLoading"
              :photos="respondentPhotos"
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
            <respondent-fill
              :respondent="respondent"></respondent-fill>
            <Permission web-only>
              <RespondentEdges
                v-if="respondent && global.study"
                :respondent-id="respondent.id"
                :study-id="global.study.id" />
            </Permission>
            <v-flex v-if="hasPermission([TrellisPermission.REMOVE_RESPONDENT])">
              <v-toolbar flat>
                <v-toolbar-title>{{$t('admin')}}</v-toolbar-title>
              </v-toolbar>
              <Permission :requires="TrellisPermission.REMOVE_RESPONDENT">
                <v-btn
                  color="error"
                  @click="deleteRespondent">
                  <v-icon>mdi-delete</v-icon>
                  {{$t('delete')}}
                </v-btn>
              </Permission>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import DocsLinkMixin from '../../mixins/DocsLinkMixin'
  import { routeQueue } from '../../router'

  import Permission from '../Permission.vue'
  import RespondentNames from './RespondentNames.vue'
  import RespondentGeos from './RespondentGeos.vue'
  import PhotoAlbum from '../photo/PhotoAlbum.vue'
  import RespondentConditionTags from './RespondentConditionTags.vue'
  import RespondentFill from './RespondentFill.vue'
  import RespondentEdges from './RespondentEdges.vue'

  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import RespondentService from '../../services/respondent'
  import Respondent from '../../entities/trellis/Respondent'
  import Vue from 'vue'
  import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
  import singleton from '../../static/singleton'
  import PermissionMixin from '../../mixins/PermissionMixin'

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
    mixins: [RouteMixinFactory(preloadRespondent, true), PermissionMixin, DocsLinkMixin('./respondents/RespondentInfo.md')],
    data () {
      return {
        global: singleton,
        respondent: null as Respondent,
        respondentPhotosLoading: true,
        respondentPhotos: [],
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
    head () {
      return {
        title: {
          inner: `${this.name} info`,
        }
      }
    },
    methods: {
      async hydrate (respondent: Respondent) {
        try {
          this.respondent = respondent
          this.respondentConditionTags = await respondent.respondentConditionTags
          this.respondentConditionTags.sort((a, b) => {
            if (!a.conditionTag || !b.conditionTag) {
              return 0
            }
            return a.conditionTag.name.localeCompare(b.conditionTag.name)
          })
          this.respondentPhotos = await RespondentService.getRespondentPhotos(respondent.id)
          this.respondentPhotosLoading = false
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      leaving () {
        this.respondentConditionTags = []
      },
      async onNewPhoto (photo) {
        let photoWithPivotTable = await RespondentService.addPhoto(this.respondent.id, photo)
        this.respondentPhotos.push(photoWithPivotTable)
        this.isAddingPhoto = false
      },
      async onUpdatePhotos (photos) {
        await RespondentService.updatePhotos(photos)
      },
      async onDeletePhoto (photo) {
        let confirmMessage = this.$t('remove_photo_confirm') + ''
        if (!window.confirm(confirmMessage)) return
        try {
          await RespondentService.removePhoto(photo)
          this.respondentPhotos.splice(this.respondentPhotos.indexOf(photo), 1)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async deleteRespondent () {
        if (!confirm(this.$t('confirm_resource_delete', [this.name]))) return
        try {
          this.isLoading = true
          await RespondentService.removeRespondent(this.respondent.id)
          this.alert('success', this.$t('resource_deleted', [this.name]))
          routeQueue.goToNextOrPrevious()
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_delete', [this.name]))
          }
        } finally {
          this.isLoading = false
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
      RespondentFill,
      RespondentNames,
      RespondentConditionTags,
      Permission,
      RespondentGeos,
      PhotoAlbum,
      RespondentEdges,
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
