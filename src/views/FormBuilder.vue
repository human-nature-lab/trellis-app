<template>
  <v-col>
    <v-progress-linear v-if="isLoading" indeterminate />
    <v-col v-else>
      <Section
        v-for="(section, index) in form.sections"
        :key="section.id"
        v-model="form.sections[index]"
        :questions="questions"
        :questionTypes="questionTypes"
        :conditionTags="conditionTags"
        :locale="locale" />
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
  import Question from '../entities/trellis/Question'
  import ConditionTag from '../entities/trellis/ConditionTag'
  import QuestionType from '../entities/trellis/QuestionType'
  import FormBuilderService from '../services/builder'

  export default Vue.extend({
    name: 'FormBuilder',
    components: { Section },
    data () {
      return {
        form: null as Form,
        locale: singleton.locale,
        conditionTags: [] as ConditionTag[],
        questionTypes: [] as QuestionType[],
        isLoading: false,
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
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
      }
    },
    computed: {
      questions (): Record<string, Question> {
        const m = {}
        if (!this.form) {
          return m
        }
        for (const section of this.form.sections) {
          for (const page of section.questionGroups) {
            for (const question of page.questions) {
              m[question.id] = question
            }
          }
        }
        return m
      }
    }
  })
</script>

<style lang="sass">
  
</style>