<template>
  <v-flex sm12>
    <FormListItem
      v-for="form in cForms"
      :key="form.id"
      :form="form"
      :respondent="respondent"
      :allow-multiple-surveys="allowMultipleSurveys"
      :can-create-surveys="canCreateSurveys"
      @update="$emit('update')"
      @newInterview="$emit('newInterview', $event)"
    />
  </v-flex>
</template>

<script lang="ts">
import Vue from 'vue'
import FormListItem from './FormListItem.vue'
import { DisplayForm } from './RespondentForms.vue'
import singleton from '../../static/singleton'

export default Vue.extend({
  name: 'FormsView',
  props: {
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
    showForm (form): boolean {
      const isTestStudy = this.global.study.testStudyId === null
      if (isTestStudy) {
        return true
      }
      if (form.isPublished && !form.isSkipped) {
        return true
      } else if (form.isSkipped) {
        return this.showHidden
      } else if (!form.isPulbished) {
        return this.showUnpublished
      } else {
        return false
      }
    },
  },
  computed: {
    cForms (): DisplayForm[] {
      return this.forms.filter(form => this.showForm(form)).map((form: DisplayForm, i) => {
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
