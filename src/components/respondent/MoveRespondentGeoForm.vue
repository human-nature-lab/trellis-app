<script lang="ts" setup>
import { ref } from 'vue'
import GeoSearch from '@/components/geo/GeoSearch.vue'
import RespondentService from '@/services/respondent'
import GeoBreadcrumbs from '../geo/GeoBreadcrumbs.vue'
import TrellisModal from '../TrellisModal.vue'
import Respondent from '@/entities/trellis/Respondent'
import RespondentGeo from '@/entities/trellis/RespondentGeo'
import Geo from '@/entities/trellis/Geo'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'

const props = defineProps<{
  value: boolean,
  respondent: Respondent,
  respondentGeo: RespondentGeo,
  geoSelectionFilter: boolean,
}>()

const emit = defineEmits<{
  (event: 'input', value: boolean): void,
  (event: 'done', oldGeo: RespondentGeo, newGeo: RespondentGeo): void,
}>()

const isSearchOpen = ref(false)
const newGeo = ref<Geo | null>(null)
const moveToUnknown = ref(false)
const isCurrent = ref(true)
const notes = ref('')

const geoSelected = (geos: Geo[]) => {
  newGeo.value = geos[0]
  isSearchOpen.value = false
}

async function save () {
  try {
    let rGeo
    if (moveToUnknown.value) {
      rGeo = await RespondentService.moveRespondentGeo(props.respondent.id, props.respondentGeo.id, null, isCurrent.value)
    } else if (newGeo.value && newGeo.value.id === props.respondentGeo.geoId) {
      return
    } else {
      rGeo = await RespondentService.moveRespondentGeo(props.respondent.id, props.respondentGeo.id, newGeo.value.id, isCurrent.value)
    }
    emit('done', props.respondentGeo, rGeo)
    newGeo.value = null
    moveToUnknown.value = false
    isCurrent.value = true
    notes.value = ''
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
    emit('input', false)
  } finally {
    newGeo.value = null
    moveToUnknown.value = false
    isCurrent.value = true
    notes.value = ''
  }
}

</script>

<template>
  <TrellisModal
    :title="$t('move_respondent_location')"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-text>
        <v-container fluid>
          <v-row no-gutters>
            <v-col>
              {{ $t('moving_from') }}
            </v-col>
            <v-col>
              <v-chip
                color="primary"
                outlined
                label
              >
                <GeoBreadcrumbs
                  v-if="respondentGeo.geoId !== null && respondentGeo.geo"
                  :geo-id="respondentGeo.geoId"
                  :can-navigate="false"
                  :max-depth="4"
                />
                <span v-if="respondentGeo.geoId === null">{{ $t('unknown_location') }}</span>
              </v-chip>
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="mt-2"
          >
            <v-col xs4>
              {{ $t('moving_to') }}
            </v-col>
            <v-col xs8>
              <v-chip
                v-if="newGeo"
                color="primary"
                outline
                label
                @click="isSearchOpen = true"
              >
                <span v-if="moveToUnknown">{{ $t('unknown_location') }}</span>
                <GeoBreadcrumbs
                  v-else
                  :geo-id="newGeo.id"
                  :can-navigate="false"
                  :max-depth="4"
                />
              </v-chip>
              <v-btn
                v-else
                :disabled="moveToUnknown"
                @click="isSearchOpen = true"
              >
                {{ $t('select_location') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="mt-4"
          >
            <v-col
              sm="6"
              cols="12"
            >
              <v-checkbox
                v-model="isCurrent"
                :label="$t('current_geo_location')"
              />
            </v-col>
            <v-col
              sm="6"
              cols="12"
            >
              <v-checkbox
                v-model="moveToUnknown"
                :label="$t('unknown_location')"
              />
            </v-col>
          </v-row>
          <v-expansion-panel inset>
            <v-expansion-panel-content>
              <div slot="header">
                {{ $t('notes') }}
              </div>
              <v-textarea
                v-model="notes"
                auto-grow
                full-width
                :placeholder="$t('notes')"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-row no-gutters>
            <v-spacer />
            <v-btn
              @click="save"
              :disabled="!moveToUnknown && !newGeo"
            >
              {{ $t('save') }}
            </v-btn>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
    <TrellisModal
      v-model="isSearchOpen"
      :title="$t('select_location')"
    >
      <GeoSearch
        :limit="1"
        :is-selectable="geoSelectionFilter"
        :show-cart="true"
        :should-update-route="false"
        @doneSelecting="geoSelected"
      />
    </TrellisModal>
  </TrellisModal>
</template>
