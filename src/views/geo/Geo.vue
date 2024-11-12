<script lang="ts" setup>
import { ref, onBeforeMount, computed, watch } from 'vue'
import { useRoute } from 'vue-router/composables'
import Geo from '@/entities/trellis/Geo'
import GeoSearch from '@/components/geo/GeoSearch.vue'
import AddGeoForm from '@/components/geo/AddGeoForm.vue'
import GeoService from '@/services/geo'
import DocsFiles from '@/components/documentation/DocsFiles'
import { routeQueue } from '@/router'
import { computedTitle } from '@/router/history'
import TranslationService from '@/services/TranslationService'
import { setDocsLink } from '@/helpers/docs.helper'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'

const $route = useRoute()
const parentGeoId = ref<string | null>(null)
const parentGeo = ref<Geo | null>(null)
const adding = ref(false)

const parentGeoName = computed(() => {
  if (parentGeo.value) {
    const translation = TranslationService.getAny(parentGeo.value.nameTranslation)
    return (translation) || '[No translation]'
  }
  return null
})

setDocsLink(DocsFiles.locations.search)
computedTitle('GeoSearch', () => {
  if (parentGeoName.value) {
    return { key: 'location_search_in', args: [parentGeoName.value] }
  }
  return { key: 'location_search' }
})

watch(() => $route.query.filters, (filters) => {
  console.log('filters changed', filters)
  if (filters) {
    parentGeoId.value = JSON.parse(filters as string).parent
  } else {
    parentGeoId.value = null
  }
}, { immediate: true })

const loadingParent = ref(false)
watch(() => parentGeoId.value, async () => {
  if (parentGeoId.value) {
    loadingParent.value = true
    try {
      parentGeo.value = await GeoService.getGeoById(parentGeoId.value)
      console.log('loaded parent geo', parentGeo.value)
    } catch (err) {
      if (isNotAuthError(err)) {
        logError(err)
      }
    } finally {
      loadingParent.value = false
    }
  } else {
    parentGeo.value = null
  }
}, { immediate: true })

function addLocationClose (addedLocation: Geo) {
  adding.value = false
  if (addedLocation instanceof Geo) {
    routeQueue.push({
      name: 'Geo',
      params: {
        geoId: addedLocation.id,
      },
    })
  }
}

function addLocation () {
  adding.value = true
}

function onParentGeoChanged (parentId: string) {
  parentGeoId.value = parentId
}

const canUserAddChild = computed(() => {
  if (adding.value || loadingParent.value || !parentGeo.value || !parentGeo.value.geoType) {
    return false
  }
  return parentGeo.value.geoType.canUserAddChild
})
</script>

<template>
  <v-container
    fill-height
    class="pa-0"
  >
    <GeoSearch
      :show-add-location-button="canUserAddChild"
      @add="addLocation"
      @parent-geo-id-changed="onParentGeoChanged"
    />
    <AddGeoForm
      v-if="adding"
      @close="addLocationClose"
      :adding="adding"
      :parent-geo-id="parentGeoId"
    />
  </v-container>
</template>
