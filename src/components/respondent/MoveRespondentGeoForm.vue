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
        <v-container fluid v-if="respondentGeo">
          <v-layout>
            Moving from:
            <v-chip
              color="primary"
              outline
              label>
              <AsyncTranslationText v-if="respondentGeo.geo" :translation="respondentGeo.geo.nameTranslation" />
              <span v-else>{{$t('unknown_location')}}</span>
            </v-chip>
          </v-layout>
          <v-layout wrap>
            <v-flex v-if="newGeo" sm6 md3>
              Moving to:
              <v-chip
                :disabled="moveToUnknown"
                color="primary"
                outline
                label>
                <AsyncTranslationText :translation="newGeo.nameTranslation" />
              </v-chip>
            </v-flex>
            <v-flex sm6 md3>
              <v-btn
                :disabled="moveToUnknown"
                @click="isSearchOpen = true">
                {{$t('select_location')}}
              </v-btn>
            </v-flex>
            <v-flex sm6 md3>
              <v-checkbox
                v-model="moveToUnknown"
                :label="$t('unknown_location')" />
            </v-flex>
          </v-layout>
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
        :is-selectable="true"
        :should-update-route="false"
        @doneSelecting="geoSelected" />
    </v-dialog>
  </v-dialog>
</template>

<script>
  import ModalTitle from '../ModalTitle'
  import GeoSearch from '../geo/GeoSearch'
  import AsyncTranslationText from '../AsyncTranslationText'
  import RespondentService from '../../services/respondent/RespondentService'

  export default {
    name: 'MoveRespondentGeoForm',
    components: {ModalTitle, AsyncTranslationText, GeoSearch},
    data () {
      return {
        isSearchOpen: false,
        newGeo: null,
        moveToUnknown: false
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
            rGeo = await RespondentService.moveRespondentGeo(this.respondent.id, this.respondentGeo.id, null)
            debugger
          } else if (this.newGeo && this.newGeo.id === this.respondentGeo.geoId) {
            return
          } else {
            rGeo = await RespondentService.moveRespondentGeo(this.respondent.id, this.respondentGeo.id, this.newGeo.id)
          }
          this.$emit('done', this.respondentGeo, rGeo)
        } catch (err) {
          console.error(err)
          this.$emit('input', false)
        } finally {
          this.newGeo = null
          this.moveToUnknown = false
        }
      }
    }
  }
</script>
