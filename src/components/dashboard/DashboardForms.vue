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
                return-object
                @change="load"
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
                @change="load" />
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
          <v-list-item>
            <v-switch
              v-model="onlyPublished"
              :label="$t('published')"
              @change="load()" />
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    <v-row no-gutters>
      <div v-if="!isLoading" class="pl-1 mr-4 subtitle-1">{{total}} surveys</div>
      <v-chip
        v-for="user in users"
        :key="user.id"
        @click:close="removeUser(user)"
        close
        class="mr-2">
        <v-icon small class="mr-2">mdi-account</v-icon>
        {{user.name}}
      </v-chip>
      <v-chip
        v-for="tag in conditionTags"
        :key="tag"
        @click:close="removeTag(tag)"
        close
        class="mr-2">
        <v-icon small class="mr-2">mdi-tag</v-icon>
        {{tag}}
      </v-chip>
      <RespondentChip
        v-for="respondent in respondents"
        :key="respondent"
        @click:close="removeRespondent(respondent)"
        close
        :value="respondent"
        class="mr-2"
        />
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
  import ConditionTag from '../../entities/trellis/ConditionTag'
  import User from '../../entities/trellis/User'
  import TrellisModal from '../TrellisModal.vue'
  import ConditionTagAutocomplete from '../ConditionTagAutocomplete.vue'
  import UserAutocomplete from '../user/UserAutocomplete.vue'
  import RespondentsSearch from '../respondent/RespondentsSearch.vue'
  import RespondentChip from '../respondent/RespondentChip.vue'
  import StudyForm from '../../entities/trellis/StudyForm'
  import TranslationService from '../../services/TranslationService'
  import PapaParse from 'papaparse'
  import { saveAs } from 'file-saver'
  import { QueryPersistMixin } from '../../mixins/QueryPersistMixin'


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
        hasLoaded: false,
        isLoading: false,
        isDownloading: false,
        onlyPublished: true,
        users: [] as User[],
        conditionTags: [] as string[],
        respondents: [] as string[],
        forms: {} as {[key: string]: { form: Form, data: SparkData }},
        persistKeys: ['respondents', 'conditionTags', 'onlyPublished']
      }
    },
    created () {
      this.readQueryState(...this.persistKeys)
    },
    watch: {
      study () {
        this.load()
      },
      min () {
        this.load()
      },
      max () {
        this.load()
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
      async load () {
        this.isLoading = true
        try {
          this.updateQueryState(...this.persistKeys)
          const res = await adminInst.get(`study/${this.study}/dashboard/forms`, {
            params: {
              min: this.min,
              max: this.max,
              users: this.users.map(u => u.id),
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
      removeUser (user: User) {
        const index = this.users.indexOf(user)
        if (index > -1) {
          this.users.splice(index, 1)
          this.load()
        }
      },
      removeTag (tag: ConditionTag) {
        const index = this.conditionTags.indexOf(tag)
        if (index > -1) {
          this.conditionTags.splice(index, 1)
          this.load()
        }
      },
      removeRespondent (id: string) {
        const index = this.respondents.indexOf(id)
        if (index > -1) {
          this.respondents.splice(index, 1)
          this.load()
        }
      },
      updateRespondents (respondents: string[]) {
        this.respondents = respondents
        this.showRespondents = false
        this.load()
      },
      downloadForms () {
        const headers = [["Date", "Count", "Form", "Form id"]]
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
        downloadName += '.csv'
        const blob = new Blob([csv], { type: 'text/csv' })
        saveAs(blob, downloadName)
      }
    }
  })
</script>

<style lang="sass">
  
</style>