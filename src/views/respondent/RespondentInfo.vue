<script lang="ts" setup>
import { routeQueue } from '@/router'

import Permission from '@/components/Permission.vue'
import RespondentNames from '@/components/respondent/RespondentNames.vue'
import RespondentGeos from '@/components/respondent/RespondentGeos.vue'
import PhotoAlbum from '@/components/photo/PhotoAlbum.vue'
import RespondentConditionTags from '@/components/respondent/RespondentConditionTags.vue'
import RespondentFill from '@/components/respondent/RespondentFill.vue'
import RespondentEdges from '@/components/respondent/RespondentEdges.vue'
import RespondentService from '@/services/respondent'
import Respondent from '@/entities/trellis/Respondent'
import { ref, computed, watch } from 'vue'
import global from '@/static/singleton'
import { computedTitle } from '@/router/history'
import { useRoute } from 'vue-router/composables'
import { setDocsLink } from '@/helpers/docs.helper'
import { isNotAuthError } from '@/helpers/auth.helper'
import { i18n } from '@/i18n'
import { alert, logError } from '@/helpers/log.helper'
import { TrellisPermission } from '@/static/permissions.base'
import { userHasPermission } from '@/helpers/user.helper'

const route = useRoute()
const loading = ref(false)
const error = ref(null)
const respondent = ref<Respondent>()
const isAddingPhoto = ref(false)
const respondentPhotosLoading = ref(false)
const respondentPhotos = ref([])
const respondentConditionTags = ref([])

const respondentErr = ref()
async function loadRespondent () {
  loading.value = true
  try {
    respondent.value = await RespondentService.getRespondentById(route.params.respondentId)
    const conditionTags = await respondent.value.respondentConditionTags
    conditionTags.sort((a, b) => {
      if (!a.conditionTag || !b.conditionTag) {
        return 0
      }
      return a.conditionTag.name.localeCompare(b.conditionTag.name)
    })
    respondentConditionTags.value = conditionTags
    respondentPhotos.value = await RespondentService.getRespondentPhotos(route.params.respondentId)
  } catch (err) {
    console.error(err)
    respondentErr.value = err
  } finally {
    loading.value = false
  }
}

watch(() => route.params.respondentId, () => {
  loadRespondent()
}, { immediate: true })

const name = computed(() => {
  if (!respondent.value) return 'Loading...'
  const rName = respondent.value.names.find(n => n.isDisplayName)
  return rName ? rName.name : respondent.value.name
})

setDocsLink('./respondents/RespondentInfo.md')
computedTitle('Respondent', () => {
  if (name.value) {
    return { key: 'respondent_info_named', args: [name.value] }
  }
  return { key: 'respondent_info' }
})

async function onNewPhoto (photo) {
  const photoWithPivotTable = await RespondentService.addPhoto(respondent.value.id, photo)
  respondentPhotos.value.push(photoWithPivotTable)
  isAddingPhoto.value = false
}
async function onUpdatePhotos (photos) {
  await RespondentService.updatePhotos(photos)
}
async function onDeletePhoto (photo) {
  const confirmMessage = i18n.t('remove_photo_confirm') + ''
  if (!window.confirm(confirmMessage)) return
  try {
    await RespondentService.removePhoto(photo)
    respondentPhotos.value.splice(respondentPhotos.value.indexOf(photo), 1)
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  }
}
async function deleteRespondent () {
  if (!confirm(i18n.t('confirm_resource_delete', [name.value]) as string)) return
  try {
    loading.value = true
    await RespondentService.removeRespondent(respondent.value.id)
    alert('success', i18n.t('resource_deleted', [name.value]))
    routeQueue.goToNextOrPrevious()
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, i18n.t('failed_resource_delete', [name.value]))
    }
  } finally {
    loading.value = false
  }
}

const err = computed(() => {
  return respondentErr.value
})
</script>

<template>
  <v-col
    v-if="respondent"
    xs="12"
    class="pa-0"
  >
    <v-card tile>
      <v-toolbar flat>
        <v-toolbar-title>
          {{ name }}
          <v-chip
            v-if="respondent.associatedRespondentId"
            label
            color="error"
            outlined
          >
            ({{ $t('other_respondent') }})
          </v-chip>
        </v-toolbar-title>
        <v-spacer />
        <v-btn :to="{name: 'RespondentForms', params: {studyId: global.study.id, respondentId: respondent.id}}">
          {{ $t('forms') }}
        </v-btn>
      </v-toolbar>
      <v-progress-linear
        v-if="loading"
        indeterminate
      />
      <v-alert
        v-if="err"
        color="error"
      >
        {{ err }}
      </v-alert>
      <v-card-text>
        <v-container
          fluid
          xs12
        >
          <v-col class="pa-0">
            <v-alert
              v-show="error"
              type="error"
            >
              {{ error }}
            </v-alert>
            <photo-album
              :loading="respondentPhotosLoading"
              :photos="respondentPhotos"
              @photo="onNewPhoto"
              @delete-photo="onDeletePhoto"
              @update-photos="onUpdatePhotos"
            />
            <respondent-geos
              :use-census-form="true"
              :study-id="global.study.id"
              :respondent="respondent"
            />
            <respondent-condition-tags
              :respondent="respondent"
              :condition-tags="respondentConditionTags"
            />
            <respondent-names
              :respondent="respondent"
              @update:respondent-names="names => respondent.names = names"
            />
            <respondent-fill
              :respondent="respondent"
            />
            <Permission web-only>
              <RespondentEdges
                v-if="respondent && global.study"
                :respondent-id="respondent.id"
                :study-id="global.study.id"
              />
            </Permission>
            <v-col v-if="userHasPermission(TrellisPermission.REMOVE_RESPONDENT)">
              <v-toolbar flat>
                <v-toolbar-title>{{ $t('admin') }}</v-toolbar-title>
              </v-toolbar>
              <Permission :requires="TrellisPermission.REMOVE_RESPONDENT">
                <v-btn
                  color="error"
                  @click="deleteRespondent"
                >
                  <v-icon>mdi-delete</v-icon>
                  {{ $t('delete') }}
                </v-btn>
              </Permission>
            </v-col>
          </v-col>
        </v-container>
      </v-card-text>
    </v-card>
  </v-col>
</template>

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
