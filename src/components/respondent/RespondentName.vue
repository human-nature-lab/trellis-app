<template>
  <v-card>
    <v-card-text>
      <v-container>
        <v-layout>
          <v-flex>
            <v-text-field
              label="Name"
              v-model="name.name"/>
          </v-flex>
          <v-flex>
            <v-checkbox
              v-model="name.is_display_name"
              label="Set as display name"
              hide-details
            ></v-checkbox>
          </v-flex>
          <v-flex>
            <v-select
              label="Locale (optional)"
              :items="locales"
              :loading="localesAreLoading"
              item-text="language_native"
              item-value="id"
              v-model="name.locale_id" />
          </v-flex>
        </v-layout>
        <v-layout>
          <v-flex>
            <v-btn @click="save()">
              <v-progress-circular v-if="isSaving"/>
              <span v-else>Save</span>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
  import LocaleService from '../../services/locale/LocaleService'
  import RespondentService from '../../services/respondent/RespondentService'
  import FormService from '../../services/form/FormService'
  import censusTypes from '../../static/census.types'
  import { pushRouteAndQueueCurrent } from '../../router'
  export default {
    name: 'respondent-name',
    props: {
      respondent: Object,
      name: {
        type: Object,
        default: () => ({name: '', is_display_name: false, locale_id: ''})
      }
    },
    data () {
      return {
        isSaving: false,
        locales: [],
        localesAreLoading: false
      }
    },
    created: function () {
      this.loadLocales()
    },
    methods: {
      loadLocales () {
        this.localesAreLoading = true
        LocaleService.getStudyLocales(this.global.study.id).then(locales => {
          this.localesAreLoading = false
          this.locales = locales
          console.log('locales', locales)
        }).catch(err => {
          this.error = err
          this.localesAreLoading = false
        })
      },
      save () {
        if (this.isSaving) return
        this.isSaving = true
        let p
        let isEditingName = this.name.id !== null && this.name.id !== undefined
        if (isEditingName) {
          let isDisplayName = this.name.is_display_name ? true : false // eslint-disable-line
          p = RespondentService.editName(
            this.respondent.id,
            this.name.id,
            this.name.name,
            isDisplayName,
            this.name.locale_id
          )
        } else {
          p = RespondentService.addName(this.respondent.id, this.name.name, this.name.is_display_name, this.name.locale_id)
        }
        this.isSaving = true
        p.catch(err => {
          this.error = err
        }).then(r => {
          return FormService.hasCensusForm(this.global.study.id, censusTypes.rename_respondent)
        }).then(hasCensus => {
          if (hasCensus) {
            pushRouteAndQueueCurrent({
              name: 'StartCensusForm',
              params: {
                studyId: this.global.study.id,
                censusTypeId: censusTypes.rename_respondent
              },
              query: {
                respondentId: this.respondent.id
              }
            })
          } else {
            console.log('no census form found')
            this.$emit('close', name)
          }
        }).catch(err => {
          this.error = err
        }).finally(() => { this.isSaving = false })
      }
    }
  }
</script>

<style scoped>

</style>
