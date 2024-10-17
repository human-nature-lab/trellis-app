<template>
  <v-container
    fluid
    class="pa-2"
  >
    <v-row no-gutters>
      <h5 class="text-h5">
        {{ translate(form.nameTranslation, global.locale) }}
      </h5>
      <v-spacer />
      <v-btn
        icon
        @click="showOpts = !showOpts"
        class="opts-btn"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-row>
    <TrellisModal
      v-model="showOpts"
      title="print_settings"
    >
      <v-container>
        <v-checkbox
          v-for="(_, name) in opts"
          :key="name"
          v-model="opts[name]"
          :label="name"
        />
        <v-checkbox
          v-model="global.printMode"
          :label="$t('print_mode')"
        />
        <LocaleSelector @change="global.locale = $event" />
        <v-btn @click="printToDoc">
          {{ $t('export_as_word') }}
        </v-btn>
      </v-container>
    </TrellisModal>
    <v-progress-linear
      v-if="isLoading"
      indeterminate
    />
    <v-col
      v-else
      v-for="section in form.sections"
      :key="section.id"
      class="section mt-2"
      cols="12"
    >
      <v-row
        v-if="opts.sectionHeaders"
        no-gutters
        title="Section details"
        class="pl-2"
      >
        <h6 class="text-h6">
          {{ translate(section.nameTranslation, global.locale) }}
        </h6>
        <v-spacer />
        <v-chip
          v-if="section.formSections[0].maxRepetitions > 0"
          label
        >
          {{ $t('repeated', [section.formSections[0].maxRepetitions]) }}
        </v-chip>
        <v-chip
          v-if="section.formSections[0].followUpQuestionId"
          label
        >
          {{ $t('follow_up_to', [questionMap[section.formSections[0].followUpQuestionId].varName]) }}
        </v-chip>
      </v-row>
      <v-col class="section-content">
        <div
          v-if="opts.sectionIndicators"
          class="section-indicator"
        />
        <v-col
          v-for="(page, pageIndex) in section.questionGroups"
          :key="page.id"
          class="page mb-2"
        >
          <v-card>
            <!-- <div v-if="opts.sectionIndicators" class="page-indicator" /> -->
            <v-card-title
              v-if="opts.pageHeaders"
              class="pa-2"
            >
              <span v-if="opts.pageTitles">
                {{ $t('page_n', [pageIndex + 1]) }}
              </span>
              <v-spacer />
              <v-chip v-if="page.skips.length">
                {{  $t('skip_count', [page.skips.length]) }}
              </v-chip>
            </v-card-title>
            <v-col v-if="opts.pageSkips && page.skips.length">
              <SkipRow
                v-for="skip in page.skips"
                :key="skip.id"
                :value="skip"
                :condition-tags="conditionTags"
                disabled
              />
            </v-col>
            <Question
              v-for="question in page.questions"
              :key="question.id"
              :question="question"
              :locale="global.locale"
              :number="questionIndices[question.id]"
              :show-numbers="opts.questionNumbers"
              :show-choices="opts.choices"
              :show-parameters="opts.parameters"
              :show-conditions="opts.assignments"
              class="mb-2"
            />
          </v-card>
        </v-col>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Form from '@/entities/trellis/Form'
import TranslateMixin from '@/mixins/TranslateMixin'
import singleton from '@/static/singleton'
import FormService from '@/services/form'
import LocaleSelector from '@/components/LocaleSelector.vue'
import TrellisModal from '@/components/TrellisModal.vue'
import SkipRow from '@/components/skips/SkipRow.vue'
import ConditionTag from '@/entities/trellis/ConditionTag'
import ConditionTagService from '@/services/condition-tag'
import QuestionEntity from '@/entities/trellis/Question'
import Question from '@/components/print/Question.vue'
import { DocService, DocxOpts } from '@/services/doc'
import { saveAs } from 'file-saver'

export default Vue.extend({
  name: 'FormPrint',
  components: { LocaleSelector, TrellisModal, SkipRow, Question },
  mixins: [TranslateMixin],
  data () {
    return {
      isLoading: false,
      showOpts: false,
      form: null as Form,
      conditionTags: [] as ConditionTag[],
      global: singleton,
      opts: {
        choices: true,
        parameters: true,
        assignments: true,
        pageTitles: true,
        pageHeaders: true,
        pageSkips: true,
        questionNumbers: true,
        sectionHeaders: true,
        sectionIndicators: true,
        showDkRf: false,
      } as DocxOpts,
    }
  },
  created () {
    singleton.printMode = true
    this.load()
  },
  beforeDestroy () {
    singleton.printMode = false
  },
  methods: {
    async load () {
      this.isLoading = true
      this.form = await FormService.getForm(this.$route.params.formId)
      this.conditionTags = await ConditionTagService.all()
      this.form.sort()
      this.isLoading = false
    },
    questionText (question: QuestionEntity): string {
      const translated = this.translate(question.questionTranslation, this.global.locale).trim()
      if (translated.startsWith('<')) {
        return 'TODO: template preview'
      } else {
        return translated
      }
    },
    async printToDoc () {
      const doc = await DocService.formToDocx(this.form, this.global.locale, this.opts)
      const name = DocService.getFormName(this.form, this.global.locale)
      saveAs(doc, name)
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
    },
  },
})
</script>

<style lang="sass">
  .print-mode
    // .scroll-container
    //   overflow: auto !important
    //   height: 100%
    // .v-application--wrap
    //   min-height: inherit !important
    // .v-main
    //   padding: 0 !important
    //   padding-top: 5px !important
    //   margin: 0 !important
    //   height: auto !important
    //   overflow: visible !important
  .code
    max-width: 100%
    white-space: pre-wrap       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap  /* Mozilla, since 1999 */
    white-space: -pre-wrap      /* Opera 4-6 */
    white-space: -o-pre-wrap    /* Opera 7 */
    word-wrap: break-word       /* Internet Explorer 5.5+ */
  .section
    page-break-before: auto
    page-break-inside: avoid
  .section-content
    position: relative
    .section-indicator
      position: absolute
      top: 0
      left: 0
      bottom: 0
      width: 5px
      height: 100%
      border-left: 1px solid grey
      border-top: 1px solid grey
      border-bottom: 1px solid grey
  .page
    page-break-before: auto
    page-break-inside: avoid

</style>
