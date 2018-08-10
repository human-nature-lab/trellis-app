<template>
  <v-container>
    <v-layout>
      <v-text-field
        :label="$t('respondent_full_name')"
        v-model="name"/>
    </v-layout>
    <v-layout>
      <v-btn @click="save()">
        <v-progress-circular v-if="isSaving"/>
        <span v-else>Save</span>
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script>
  import RespondentService from '../../services/respondent/RespondentService'
  import CensusFormService from '../../services/census'
  import censusTypes from '../../static/census.types'
  import {pushRouteAndQueueCurrent} from '../../router'
  export default {
    name: 'add-respondent-form',
    props: {
      associatedRespondentId: String,
      studyId: String
    },
    data () {
      return {
        name: '',
        geoId: null,
        isSaving: false
      }
    },
    methods: {
      async save () {
        this.isSaving = true
        let censusTypeId = this.associatedRespondentId ? censusTypes.add_associated_respondent : censusTypes.add_respondent
        try {
          let respondent = await RespondentService.createRespondent(this.studyId, this.name, this.geoId, this.associatedRespondentId)
          let hasCensus = await CensusFormService.hasCensusForm(this.studyId, censusTypeId)
          if (hasCensus) {
            pushRouteAndQueueCurrent({
              name: 'StartCensusForm',
              params: {
                studyId: this.studyId,
                censusTypeId: censusTypeId
              },
              query: {
                respondentId: respondent.id
              }
            })
          } else {
            console.log('no census form found')
            this.$emit('close', respondent)
          }
        } catch (err) {
          this.error = err
        } finally {
          this.isSaving = false
        }
      }
    }
  }
</script>

<style scoped>

</style>
