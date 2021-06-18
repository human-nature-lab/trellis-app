<template>
  <v-col v-intersect="onIntersect">
    <v-card-title class="py-0 px-1">
      {{$t('forms')}}
      <v-spacer />
      <v-btn @click="downloadForms" class="mx-1">
        Download
        <v-icon small class="ml-2">mdi-download</v-icon>
      </v-btn>
      <TrellisModal v-model="showUser" :title="$t('add_user')">
        <template #activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" class="mx-1">
            {{$t('add_user')}}
            <v-icon small class="ml-2">mdi-plus</v-icon>
          </v-btn>
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
          <v-btn v-on="on" v-bind="attrs" class="mx-1">
            {{$t('add_tag')}}
            <v-icon small class="ml-2">mdi-plus</v-icon>
          </v-btn>
        </template>
        <v-container>
          <ConditionTagAutocomplete
            v-model="conditionTags"
            @change="load" />
        </v-container>
      </TrellisModal>
      <v-switch 
        v-model="onlyPublished"
        :label="$t('published')"
        @change="load()" />
    </v-card-title>
    <v-row no-gutters>
      <v-chip v-for="user in users" :key="user.id" @click:close="removeUser(user)" close>
        <v-icon small class="mr-2">mdi-account</v-icon> {{user.name}}
      </v-chip>
      <v-chip v-for="tag in conditionTags" :key="tag" @click:close="removeTag(tag)" close>
        <v-icon small class="mr-2">mdi-tag</v-icon> {{tag}}
      </v-chip>
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
  import StudyForm from '../../entities/trellis/StudyForm'
  import TranslationService from '../../services/TranslationService'
  import PapaParse from 'papaparse'
  import { saveAs } from 'file-saver'


  export default Vue.extend({
    name: 'DashboardForms',
    components: { SparkCard, TranslatedText, TrellisModal, ConditionTagAutocomplete, UserAutocomplete },
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
        hasLoaded: false,
        isLoading: false,
        isDownloading: false,
        onlyPublished: true,
        users: [] as User[],
        conditionTags: [] as ConditionTag[],
        forms: {} as {[key: string]: { form: Form, data: SparkData }}
      }
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
          const res = await adminInst.get(`study/${this.study}/dashboard/forms`, {
            params: {
              min: this.min,
              max: this.max,
              users: this.users.map(u => u.id),
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
        let downloadName = `${this.min}-${this.max}_form_count`
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