<template>
  <v-col>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <FormListItem
      v-for="form in cForms"
      :key="form.id"
      :form="form"
      :disabled="disabled"
      :respondent="respondent"
      :allow-multiple-surveys="allowMultipleSurveys"
      :can-create-surveys="canCreateSurveys"
      @survey="survey => updateSurvey(form, survey)"
      @newInterview="$emit('newInterview', $event)"
    />
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import FormListItem, { DisplayForm } from './FormListItem.vue'
import singleton from '../../static/singleton'
import Form from '../../entities/trellis/Form'
import Survey from '../../entities/trellis/Survey'

export default Vue.extend({
  name: 'FormsView',
  props: {
    disabled: Boolean,
    loading: Boolean,
    respondent: {
      type: Object,
      required: true,
    },
    forms: {
      type: Array,
      required: true,
    },
    showHidden: {
      type: Boolean,
      default: false,
    },
    showUnpublished: {
      type: Boolean,
      default: false,
    },
    allowMultipleSurveys: {
      type: Boolean,
      default: false,
    },
    canCreateSurveys: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      global: singleton,
    }
  },
  methods: {
    showForm (form: Form): boolean {
      const isTestStudy = this.global.study.testStudyId === null
      if (isTestStudy) {
        return !form.isSkipped
      }
      if (form.isPublished && !form.isSkipped) {
        return true
      } else if (form.isSkipped) {
        return this.showHidden
      } else if (!form.isPublished) {
        return this.showUnpublished
      } else {
        return false
      }
    },
    updateSurvey (form: DisplayForm, survey: Survey) {
      const index = form.surveys.findIndex(s => s.id === survey.id)
      form.surveys.splice(index, 1, survey)
      this.$emit('update:forms', this.forms)
    },
  },
  computed: {
    cForms (): DisplayForm[] {
      return this.forms.filter(form => this.showForm(form)).map((form: DisplayForm) => {
        form.nComplete = form.surveys.reduce((c, s) => (s.completedAt ? c + 1 : c), 0)
        form.isComplete = (form.surveys.length && !!form.surveys[0].completedAt) || false
        form.isStarted = (form.surveys.length && !form.surveys[0].completedAt) || false
        return form
      })
    },
  },
  components: {
    FormListItem,
  },
})
</script>
