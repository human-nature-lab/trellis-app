<template>
  <v-col>
    <v-row v-if="form" no-gutters>
      <div class="title" v-if="form">
        <TranslatedText :translation="form.nameTranslation" :locale="locale" />
      </div>
      <v-spacer />
      <BuilderMenu @addSection="addSection" />
    </v-row>
    <v-progress-linear v-if="isLoading" indeterminate />
    <v-col v-else>
      <Section
        v-for="(section, index) in form.sections"
        :key="section.id"
        v-model="form.sections[index]"
      />
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Form from '../entities/trellis/Form'
import Vue from 'vue'
import FormService from '../services/form/FormService'
import ConditionTagService from '../services/condition-tag'
import Section from '../components/builder/Section.vue'
import singleton from '../static/singleton'
import ConditionTag from '../entities/trellis/ConditionTag'
import QuestionType from '../entities/trellis/QuestionType'
import FormBuilderService from '../services/builder'
import TrellisModal from '../components/TrellisModal.vue'
import TranslatedText from '../components/TranslatedText.vue'
import BuilderMenu from '../components/builder/BuilderMenu.vue'

export default Vue.extend({
  name: 'FormBuilder',
  components: { Section, TrellisModal, TranslatedText, BuilderMenu },
  data() {
    return {
      isLoading: false,
      form: null as Form,
      locale: singleton.locale,
      questionTypes: [] as QuestionType[],
      conditionTags: [] as ConditionTag[],
    }
  },
  provide() {
    const p = {}
    Object.defineProperty(p, 'builder', {
      enumerable: true,
      get: () => ({
        form: this.form,
        studyId: singleton.study.id,
        locale: this.locale,
        questionTypes: this.questionTypes,
        conditionTags: this.conditionTags,
      }),
    })
    return p
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.isLoading = true
      try {
        const form = await FormService.getForm(this.$route.params.formId)
        this.conditionTags = await ConditionTagService.all()
        this.questionTypes = await FormBuilderService.getQuestionTypes()
        this.questionTypes.sort((a, b) => a.name.localeCompare(b.name))
        form.sort()
        this.form = form
      } catch (err) {
        this.alert('error', err)
      } finally {
        this.isLoading = false
      }
    },
    async addSection() {
      this.isLoading = true
      try {
        const section = await FormService.createSection(this.$route.params.formId)
        this.form.sections.push(section)
      } finally {
        this.isLoading = false
      }
    }
  },
})
</script>

<style lang="sass">

</style>