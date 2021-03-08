<template>
  <v-col v-intersect="onIntersect">
    <v-card-title>
      Forms
      <v-spacer />
      <TrellisModal v-model="showUser" :title="$t('add_user')">
        <template #activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs">
            {{$t('add_user')}}
            <v-icon small>mdi-plus</v-icon>
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
          <v-btn v-on="on" v-bind="attrs">
            {{$t('add_tag')}}
            <v-icon small>mdi-plus</v-icon>
          </v-btn>
        </template>
        <v-container>
          <ConditionTagAutocomplete
            v-model="conditionTags"
            @change="load" />
        </v-container>
      </TrellisModal>
    </v-card-title>
    <v-row>
      <v-chip v-for="user in users" :key="user.id">
        {{$t('user')}}: {{user.name}}
      </v-chip>
      <v-chip v-for="tag in conditionTags" :key="tag">
        {{$t('tag')}}: {{tag}}
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
              conditionTags: this.conditionTags
            }
          })
          const forms = res.data
          for (const id in forms) {
            forms[id].form = new Form().fromSnakeJSON(forms[id].form)
          }
          this.forms = forms
        } finally {
          this.isLoading = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>