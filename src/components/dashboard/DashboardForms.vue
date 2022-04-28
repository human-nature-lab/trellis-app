<template>
  <v-col v-intersect="onIntersect">
    <v-card-title class="py-0 px-1">
      <div>
        <div>{{$t('forms')}}</div>
      </div>
      <v-spacer />
      <v-btn @click="downloadForms" class="mx-1">
        Download
        <v-icon small class="ml-2">mdi-download</v-icon>
      </v-btn>
      <v-menu offset-y left>
        <template #activator="{ on, attrs}">
          <v-btn v-on="on" v-bind="attrs">
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </template>
        <v-list>
          <TrellisModal v-model="showUser" :title="$t('add_user')">
            <template #activator="{ on, attrs }">
              <v-list-item v-on="on" v-bind="attrs">
                <v-list-item-avatar>
                  <v-icon>mdi-account</v-icon>
                </v-list-item-avatar>
                {{$t('add_user')}}
              </v-list-item>
            </template>
            <v-container>
              <UserAutocomplete
                v-model="users"
                :study="study"
                @change="loadDebounced"
                multiple />
            </v-container>
          </TrellisModal>
          <TrellisModal v-model="showTag" :title="$t('add_condition_tag')">
            <template #activator="{ on, attrs }">
              <v-list-item v-on="on" v-bind="attrs">
                <v-list-item-avatar>
                  <v-icon>mdi-tag</v-icon>
                </v-list-item-avatar>
                {{$t('add_tag')}}
              </v-list-item>
            </template>
            <v-container>
              <ConditionTagAutocomplete
                v-model="conditionTags"
                @change="loadDebounced" />
            </v-container>
          </TrellisModal>
          <TrellisModal v-model="showRespondents" :title="$t('add_respondent')">
            <template #activator="{ on, attrs }">
              <v-list-item v-on="on" v-bind="attrs">
                <v-list-item-avatar>
                  <v-icon>mdi-account-group</v-icon>
                </v-list-item-avatar>
                {{$t('add_respondent')}}
              </v-list-item>
            </template>
            <RespondentsSearch
              @selected="updateRespondents"
              :selectedRespondents="respondents" 
              :canSelect="true"
              :formsButtonVisible="false"
              :infoButtonVisible="false"
              :shouldUpdateRoute="false" 
              :canAddRespondent="false"
              :canRemoveGeos="false" />
          </TrellisModal>
          <TrellisModal v-model="showGeos" :title="$t('add_geo')">
            <template #activator="{ on, attrs }">
              <v-list-item v-on="on" v-bind="attrs">
                <v-list-item-avatar>
                  <v-icon>mdi-map-marker</v-icon>
                </v-list-item-avatar>
                {{$t('add_geo')}}
              </v-list-item>
            </template>
            <GeoSearch 
              :showRespondentsLink="false"
              :showCart="true"
              :isSelectable="true"
              :shouldUpdateRoute="false"
              @doneSelecting="updateGeos" />
          </TrellisModal>
          <v-list-item>
            <v-switch
              v-model="onlyPublished"
              :label="$t('published')"
              @change="loadDebounced()" />
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    <v-row no-gutters>
      <div class="pl-1 mr-4 subtitle-1">{{total}} surveys</div>
      <UserChip
        v-for="user in users"
        :key="user"
        @click:close="removeUser(user)"
        close
        :value="user" 
        class="mr-2 mb-2" />
      <v-chip
        v-for="tag in conditionTags"
        :key="tag"
        @click:close="removeTag(tag)"
        close
        class="mr-2 mb-2">
        <v-icon small class="mr-2">mdi-tag</v-icon>
        {{tag}}
      </v-chip>
      <RespondentChip
        v-for="respondent in respondents"
        :key="respondent"
        @click:close="removeRespondent(respondent)"
        close
        :value="respondent"
        class="mr-2 mb-2"
        />
      <GeoChip 
        v-for="geo in geos"
        :key="geo"
        @click:close="removeGeo(geo)"
        close
        :value="geo"
        class="mr-2 mb-2" />
    </v-row>
    <v-row v-if="isLoading">
      <v-col cols="12" md="6" v-for="i in 4" :key="i">
        <v-card>
          <v-skeleton-loader
            type="card-heading,image" />
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" md="6" v-for="(form, id) in forms" :key="id">
        <SparkCard
          :value="form.data.data"
          :min="min"
          :max="max"
          :labels="form.data.labels">
          <template #title>
            <TranslatedText
              :translation="form.form.nameTranslation"
              :locale="locale" />
          </template>
        </SparkCard>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Form from '../../entities/trellis/Form'
  import { adminInst } from '../../services/http/AxiosInstance'
  import SparkCard, { SparkData } from './SparkCard.vue'
  import TranslatedText from '../TranslatedText.vue'
  import TrellisModal from '../TrellisModal.vue'
  import ConditionTagAutocomplete from '../ConditionTagAutocomplete.vue'
  import UserAutocomplete from '../user/UserAutocomplete.vue'
  import RespondentsSearch from '../respondent/RespondentsSearch.vue'
  import RespondentChip from '../respondent/RespondentChip.vue'
  import GeoChip from '../geo/GeoChip.vue'
  import GeoSearch from '../geo/GeoSearch.vue'
  import UserChip from '../user/UserChip.vue'
  import StudyForm from '../../entities/trellis/StudyForm'
  import TranslationService from '../../services/TranslationService'
  import PapaParse from 'papaparse'
  import { saveAs } from 'file-saver'
  import { QueryPersistMixin } from '../../mixins/QueryPersistMixin'
  import { debounce } from 'lodash'
  import Geo from '../../entities/trellis/Geo'

  export default Vue.extend({
    name: 'DashboardForms',
    mixins: [QueryPersistMixin],
    components: {
      SparkCard,
      TranslatedText,
      TrellisModal,
      ConditionTagAutocomplete,
      UserAutocomplete,
      RespondentsSearch,
      RespondentChip,
      UserChip,
      GeoChip,
      GeoSearch,
    },
    props: {
      study: String,
      locale: Object,
      min: String,
      max: String
    },
    data () {
      return {
        showTag: false,
        showUser: false,
        showRespondents: false,
        showGeos: false,
        hasLoaded: false,
        isLoading: false,
        isDownloading: false,
        onlyPublished: true,
        users: [] as string[],
        geos: [] as string[],
        conditionTags: [] as string[],
        respondents: [] as string[],
        forms: {} as {[key: string]: { form: Form, data: SparkData }},
        // Which data on the model to persist
        persistKeys: ['respondents', 'conditionTags', 'onlyPublished', 'users', 'geos']
      }
    },
    created () {
      this.readQueryState(...this.persistKeys)
    },
    watch: {
      study () {
        console.log('DashboardForms.study', this.study)
        this.loadDebounced()
      },
      min () {
        console.log('DashboardForms.min', this.min)
        this.loadDebounced()
      },
      max () {
        console.log('DashboardForms.max', this.max)
        this.loadDebounced()
      }
    },
    computed: {
      total (): number {
        let sum = 0
        for (const id in this.forms) {
          sum += this.forms[id].data.data.reduce((t, v) => t + v, 0)
        }
        return sum
      },
      hasFilters (): boolean {
        return this.conditionTags.length || this.users.length
      }
    },
    methods: {
      onIntersect (entries: { isIntersecting: boolean }[]) {
        if (this.hasLoaded) return
        if (entries[0].isIntersecting) {
          this.load()
          this.hasLoaded = true
        }
      },
      loadDebounced: debounce(function () { this.load() }, 400),
      async load () {
        if (!this.min || !this.max) return
        this.isLoading = true
        try {
          this.updateQueryState(...this.persistKeys)
          const res = await adminInst.get(`study/${this.study}/dashboard/forms`, {
            params: {
              min: this.min,
              max: this.max,
              users: this.users,
              geos: this.geos,
              respondents: this.respondents,
              conditionTags: this.conditionTags,
              onlyPublished: +this.onlyPublished
            }
          })
          const forms = res.data
          const studyForms = []
          for (const id in forms) {
            studyForms.push(new StudyForm().fromSnakeJSON(forms[id].form))
          }

          // All of this work is just to get the forms to show up in the correct order
          studyForms.sort((a: StudyForm, b: StudyForm) => {
            if (a.censusTypeId) {
              return 0
            }
            return a.sortOrder - b.sortOrder
          })
          const newForms = {}
          for (const f of studyForms) {
            newForms[f.form.id] = {
              data: forms[f.form.id].data,
              form: f.form
            }
          }
          this.forms = newForms
        } finally {
          this.isLoading = false
        }
      },
      removeUser (user: string) {
        const index = this.users.indexOf(user)
        if (index > -1) {
          this.users.splice(index, 1)
          this.loadDebounced()
        }
      },
      removeTag (tag: string) {
        const index = this.conditionTags.indexOf(tag)
        if (index > -1) {
          this.conditionTags.splice(index, 1)
          this.loadDebounced()
        }
      },
      removeRespondent (id: string) {
        const index = this.respondents.indexOf(id)
        if (index > -1) {
          this.respondents.splice(index, 1)
          this.loadDebounced()
        }
      },
      removeGeo (id: string) {
        const index = this.geos.indexOf(id)
        if (index > -1) {
          this.geos.splice(index, 1)
          this.loadDebounced()
        }
      },
      updateRespondents (respondents: string[]) {
        this.respondents = respondents
        this.showRespondents = false
        this.loadDebounced()
      },
      updateGeos (geos: Geo[]) {
        this.geos = geos.map(g => g.id)
        this.showGeos = false
        this.loadDebounced()
      },
      downloadForms () {
        const headers = [["Date", "Survey Count", "Form", "Form id"]]
        const rows = []
        for (const id in this.forms) {
          const f = this.forms[id]
          const formName = TranslationService.getTranslated(f.form.nameTranslation, this.locale)
          for (let i = 0; i < f.data.labels.length; i++) {
            rows.push([f.data.labels[i], f.data.data[i], formName, id])
          }
        }
        if (!rows.length) {
          alert('No data to download. Try changing dates and other filters.')
          return
        }
        rows.sort((a, b) => a[0].localeCompare(b[0]))
        const csv = PapaParse.unparse(headers.concat(rows))
        let downloadName = `${this.min}-${this.max}_forms`
        if (this.conditionTags.length) {
          downloadName += `_cond_${this.conditionTags.join('-')}`
        }
        if (this.users.length) {
          downloadName += `_user_${this.users.map(u => u.username)}`
        }
        if (this.geos.length) {
          downloadName += `_geo_${this.geos.join('_')}`
        }
        if (this.respondents.length) {
          downloadName += `_resp_${this.respondents.join('_')}`
        }
        downloadName += '.csv'
        const blob = new Blob([csv], { type: 'text/csv' })
        saveAs(blob, downloadName)
      }
    }
  })
</script>

<style lang="sass">
  
</style>