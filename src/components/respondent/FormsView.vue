<template>
  <v-flex sm12>
    <FormListItem
      v-for="form in cForms"
      :key="form.id"
      :form="form"
      :respondent="respondent"
      :allowMultipleSurveys="allowMultipleSurveys"
      :canCreateSurveys="canCreateSurveys"
      @update="$emit('update')"
      @newInterview="$emit('newInterview', $event)"
      v-if="showForm(form)" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  // @ts-ignore
  import FormListItem from './FormListItem'
  import { DisplayForm } from './RespondentForms'
  import singleton from '../../static/singleton'
  import Interview from '../../entities/trellis/Interview'

  export default Vue.extend({
    name: 'forms-view',
    props: {
      respondent: {
        type: Object,
        required: true
      },
      forms: {
        type: Array,
        required: true
      },
      showHidden: {
        type: Boolean,
        default: false
      },
      showUnpublished: {
        type: Boolean,
        default: false
      },
      allowMultipleSurveys: {
        type: Boolean,
        default: false
      },
      canCreateSurveys: {
        type: Boolean,
        default: true
      }
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
        } else if (form.isPublished) {
          return this.showHidden
        } else if (form.isSkipped) {
          return this.showUnpublished
        } else {
          return false
        }
      }
    },
    computed: {
      cForms (): DisplayForm[] {
        return this.forms.map((form: DisplayForm, i) => {
          form.nComplete = form.surveys.reduce((c, s) => (s.completedAt ? c + 1 : c), 0)
          form.isComplete = form.surveys.length && !!form.surveys[0].completedAt || false
          form.isStarted = form.surveys.length && !form.surveys[0].completedAt || false
          return form
        })
      }
    },
    components: {
      FormListItem
    }
  })
</script>

<style lang="sass" scoped>

</style>
