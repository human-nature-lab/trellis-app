<template>
  <v-container fluid>
    <v-row>
      <v-spacer />
      <v-btn icon @click="showOpts = !showOpts" class="opts-btn">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-row>
    <v-slide-y-transition>
      <v-col v-show="showOpts">
        <v-checkbox v-model="opts.questionNumbers" label="Question numbers" />
        <v-checkbox v-model="opts.choices" label="Choices" />
        <v-checkbox v-model="opts.pageHeaders" label="Page headers" />
        <v-checkbox v-model="opts.sectionHeaders" label="Section headers" />
        <v-checkbox v-model="opts.locationIndicators" label="Location indicators" />
        <v-checkbox v-model="global.printMode" label="Print mode" />
        <LocaleSelector @change="global.locale = $event" />
      </v-col>
    </v-slide-y-transition>
    <v-progress-linear v-if="isLoading" indeterminate />
    <v-col v-else v-for="section in form.sections" :key="section.id" class="section mb-4">
      <div v-if="opts.locationIndicators" class="section-indicator" />
      <v-row v-if="opts.sectionHeaders" no-gutters title="Section details">
        {{translate(section.nameTranslation, global.locale)}}
        <v-spacer />
        <v-chip v-if="section.formSections[0].maxRepetitions > 0" label>
          Repeated {{section.formSections[0].maxRepetitions}} times
        </v-chip>
        <v-chip v-if="section.formSections[0].followUpQuestionId" label>
          Follow up to "{{questionMap[section.formSections[0].followUpQuestionId].varName}}"
        </v-chip>
      </v-row>
      <v-col v-for="(page, pageIndex) in section.questionGroups" :key="page.id" class="page mb-2">
        <div v-if="opts.locationIndicators" class="page-indicator" />
        <v-row v-if="opts.pageHeaders" no-gutters class="pa-2">
          Page: {{pageIndex + 1}}
        </v-row>
        <v-row v-for="question in page.questions" :key="question.id" class="question mb-2">
          <v-col>
            <v-row no-gutters class="primary pa-2">
              <span v-if="opts.questionNumbers" class="mr-1">{{questionIndices[question.id] + 1}}.</span>
              <span title="Variable name">{{question.varName}}</span>
              <v-spacer />
              <span title="Question type">({{question.questionType.name}})</span>
            </v-row>
            <v-row no-gutter class="pa-4">
              {{translate(question.questionTranslation, global.locale)}}
            </v-row>
            <v-radio-group v-if="opts.choices && question.questionType.name === 'multiple_choice'">
              <v-radio
                v-for="choice in question.choices"
                :key="choice.id"
                :label="translate(choice.choice.choiceTranslation, global.locale)" />
            </v-radio-group>
            <ul v-if="opts.choices && question.questionType.name === 'multiple_select'">
              <v-checkbox
                v-for="choice in question.choices"
                :key="choice.id"
                :label="translate(choice.choice.choiceTranslation, global.locale)" />
            </ul>
          </v-col>
        </v-row>
      </v-col>
      <br />
    </v-col>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Form from '../entities/trellis/Form'
  import Question from '../entities/trellis/Question'
  import TranslateMixin from '../mixins/TranslateMixin'
  import singleton from '../static/singleton'
  import FormService from '../services/form/FormService'
  import LocaleSelector from '../components/LocaleSelector.vue'

  export default Vue.extend({
    name: 'FormPrint',
    components: { LocaleSelector },
    mixins: [TranslateMixin],
    data () {
      return {
        isLoading: false,
        showOpts: false,
        form: null as Form,
        global: singleton,
        opts: {
          choices: true,
          pageHeaders: false,
          questionNumbers: true,
          sectionHeaders: true,
          locationIndicators: true
        }
      }
    },
    created () {
      singleton.printMode = true
      this.load()
    },
    methods: {
      async load () {
        this.isLoading = true
        this.form = await FormService.getForm(this.$route.params.formId)
        this.form.sections.sort((a, b) => {
          return a.formSections[0].sortOrder - b.formSections[0].sortOrder
        })
        for (const section of this.form.sections) {
          section.questionGroups.sort((a, b) => {
            return a.sectionQuestionGroup.questionGroupOrder - b.sectionQuestionGroup.questionGroupOrder
          })
          for (const page of section.questionGroups) {
            page.questions.sort((a, b) => {
              return a.sortOrder - b.sortOrder
            })
            for (const question of page.questions) {
              if (question.choices) {
                question.choices.sort((a, b) => {
                  return a.sortOrder - b.sortOrder
                })
              }
            }
          }
        }
        this.isLoading = false
      },
      questionText (question: Question): string {
        const translated = this.translate(question.questionTranslation, this.global.locale).trim()
        if (translated.startsWith('<')) {
          return 'TODO: template preview'
        } else {
          return translated
        }
      },
    },
    computed: {
      questionIndices (): { [key: string]: number } {
        const index = {}
        let i = 0
        for (const section of this.form.sections) {
          for (const page of section.questionGroups) {
            for (const question of page.questions) {
              index[question.id] = i
              i++
            }
          }
        }
        return index
      },
      questionMap (): { [key: string]: Question } {
        const index = {}
        for (const section of this.form.sections) {
          for (const page of section.questionGroups) {
            for (const question of page.questions) {
              index[question.id] = question
            }
          }
        }
        return index
      }
    }
  })
</script>

<style lang="sass">
  .print-mode
    .v-main
      overflow: visible
  .section, .page
    position: relative
  .page-indicator, .section-indicator
    position: absolute
    top: 0
    left: 0
    width: 5px
    height: 90%
  .section-indicator
    margin-top: 24px
    border-left: 1px solid grey
    border-top: 1px solid grey
    border-bottom: 1px solid grey
  .page-indicator
    margin-top: 30px
    border-left: 1px solid lightgrey
    border-top: 1px solid lightgrey
    border-bottom: 1px solid lightgrey
</style>