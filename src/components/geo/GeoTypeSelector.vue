<script lang="ts" setup>
import { ref, watch } from 'vue'
import GeoType from '../../entities/trellis/GeoType'
import GeoService from '../../services/geo'
import global from '../../static/singleton'
import { logError } from '@/helpers/log.helper'
import { isNotAuthError } from '@/helpers/auth.helper'

const props = defineProps<{
  value: GeoType | null
  disableButton?: boolean
  showUserAddable?: boolean
  geoType?: GeoType
}>()

const emit = defineEmits<{
  (e: 'input', value: GeoType | null): void
  (e: 'geo-type-selected', geoType: GeoType): void
}>()

const geoTypes = ref<GeoType[]>([])
const curGeoType = ref<GeoType | null>(props.value || null)

function updateGeoType () {
  emit('input', curGeoType.value)
  emit('geo-type-selected', curGeoType.value)
}

const loading = ref(false)
watch(() => global.study, async s => {
  try {
    loading.value = true
    geoTypes.value = await GeoService.getGeoTypesByStudy(global.study.id, props.showUserAddable)
    if (props.value) {
      curGeoType.value = geoTypes.value.find((gt) => gt.id === props.value.id)
    } else if (props.geoType) {
      curGeoType.value = geoTypes.value.find((gt) => gt.id === props.geoType.id)
    }
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <v-row>
    <v-col>
      <v-select
        single-line
        return-object
        :loading="loading"
        :items="geoTypes"
        v-model="curGeoType"
        item-text="name"
        :label="$t('select_location_type')"
      />
      <v-btn
        :disabled="curGeoType === null || disableButton"
        text
        right
        @click="updateGeoType"
      >
        {{ $t('select') }}
      </v-btn>
    </v-col>
  </v-row>
</template>
