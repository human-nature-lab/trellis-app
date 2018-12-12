<template>
  <v-dialog
    lazy
    :value="value"
    @input="$emit('input', $event)">
    <v-card>
      <ModalTitle
        :title="$t('move_respondent_location')"
        @close="$emit('input', false)" />
      <v-card-text>
        <v-container fluid>
          <v-layout row wrap align-center>
            <v-flex xs4>
              Moving from:
            </v-flex>
            <v-flex xs8>
              <v-chip
                color="primary"
                outline
                label
                v-if="respondentGeo !== null">
                <GeoBreadcrumbs
                  v-if="respondentGeo.geo"
                  :geoId="respondentGeo.geoId"
                  :canNavigate="false"
                  :maxDepth="4" />
                <span v-if="respondentGeo.geo === null">{{$t('unknown_location')}}</span>
              </v-chip>
            </v-flex>
          </v-layout>
          <v-layout row wrap align-center>
            <v-flex xs4>
              Moving to:
            </v-flex>
            <v-flex xs8>
              <v-chip
                v-if="newGeo"
                color="primary"
                outline
                label
                @click="isSearchOpen = true">
                <span v-if="moveToUnknown">{{$t('unknown_location')}}</span>
                <GeoBreadcrumbs
                  v-else
                  :geoId="newGeo.id"
                  :canNavigate="false"
                  :maxDepth="4" />
              </v-chip>
              <v-btn
                v-else
                :disabled="moveToUnknown"
                @click="isSearchOpen = true">
                {{$t('select_location')}}
              </v-btn>
            </v-flex>
          </v-layout>
          <v-layout row wrap mt-3>
            <v-flex xs6>
              <v-checkbox
                v-model="isCurrent"
                :label="$t('current_geo_location')" />
            </v-flex>
            <v-flex xs6>
              <v-checkbox
                v-model="moveToUnknown"
                :label="$t('unknown_location')" />
            </v-flex>
          </v-layout>
          <v-expansion-panel inset>
            <v-expansion-panel-content>
              <div slot="header">{{ $t('notes') }}</div>
              <v-text-field
                v-model="notes"
                auto-grow
                full-width
                :placeholder="$t('notes')"
                textarea/>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-layout>
            <v-spacer />
            <v-btn
              @click="save"
              :disabled="!moveToUnknown && !newGeo">
              {{$t('save')}}
            </v-btn>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
    <v-dialog v-model="isSearchOpen">
      <ModalTitle
        :title="$t('select_location')"
        @close="isSearchOpen = false" />
      <GeoSearch
        :limit="1"
        :isSelectable="true"
        :showCart="true"
        :shouldUpdateRoute="false"
        @doneSelecting="geoSelected" />
    </v-dialog>
  </v-dialog>
</template>

<script>
  import ModalTitle from '../ModalTitle'
  import GeoSearch from '../geo/GeoSearch'
  import AsyncTranslationText from '../AsyncTranslationText'
  import RespondentService from '../../services/respondent/RespondentService'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'

  export default {
    name: 'MoveRespondentGeoForm',
    components: {GeoBreadcrumbs, ModalTitle, AsyncTranslationText, GeoSearch},
    data () {
      return {
        isSearchOpen: false,
        newGeo: null,
        moveToUnknown: false,
        isCurrent: true,
        notes: ''
      }
    },
    props: {
      value: {
        type: Boolean,
        required: true
      },
      respondent: {
        type: Object,
        required: true
      },
      respondentGeo: {
        type: Object,
        required: true
      }
    },
    methods: {
      geoSelected (geos) {
        this.newGeo = geos[0]
        this.isSearchOpen = false
      },
      async save () {
        try {
          let rGeo
          if (this.moveToUnknown) {
            rGeo = await RespondentService.moveRespondentGeo(this.respondent.id, this.respondentGeo.id, null, this.isCurrent)
          } else if (this.newGeo && this.newGeo.id === this.respondentGeo.geoId) {
            return
          } else {
            rGeo = await RespondentService.moveRespondentGeo(this.respondent.id, this.respondentGeo.id, this.newGeo.id, this.isCurrent)
          }
          this.$emit('done', this.respondentGeo, rGeo)
        } catch (err) {
          console.error(err)
          this.$emit('input', false)
        } finally {
          this.newGeo = null
          this.moveToUnknown = false
          this.isCurrent = true
          this.notes = ''
        }
      }
    }
  }
</script>
