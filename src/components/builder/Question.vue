<template>
  <v-col class="mb-4">
    <QuestionHeader
      :value="value"
      :show-parameters.sync="showParameters"
      :show-conditions.sync="showConditions"
      :show-choices.sync="showChoices"
      :allow-choices="isChoiceType"
      @change="updateQuestion"
      @remove="$emit('remove')"
      :loading="working"
    />
    <v-col class="question-content">
      <Translation
        :locale="builder.locale"
        :locked="builder.locked"
        v-model="value.questionTranslation"
        class="text-body-1"
        autogrow
        editable
        textarea
      />
      <ExpandSection
        v-if="isChoiceType"
        v-model="showChoices"
        global
      >
        <QuestionChoices
          :question-id="value.id"
          :disabled="builder.locked"
          v-model="value.choices"
          :locale="builder.locale"
        />
      </ExpandSection>
      <ExpandSection
        v-model="showParameters"
        global
      >
        <QuestionParameters
          v-if="showParameters"
          :disabled="builder.locked"
          v-model="value.questionParameters"
          :parameters="builder.parameters"
          :condition-tags="builder.conditionTags"
          :locale="builder.locale"
          :geo-types="builder.geoTypes"
          :question-id="value.id"
          :choices="value.choices"
        />
      </ExpandSection>
      <ExpandSection
        v-model="showConditions"
        global
      >
        <QuestionConditions
          v-if="showConditions"
          :question-id="value.id"
          :condition-tags="builder.conditionTags"
          :disabled="builder.locked"
          v-model="value.assignConditionTags"
        />
      </ExpandSection>
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import Question from '../../entities/trellis/Question'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'
import Translation from './Translation.vue'
import QuestionHeader from './QuestionHeader.vue'
import QuestionParameters from './QuestionParameters.vue'
import { builder } from '../../symbols/builder'
import QuestionChoices from './QuestionChoices.vue'
import questionTypes from '../../static/question.types'
import QuestionConditions from './QuestionConditions.vue'
import builderService from '../../services/builder'
import ExpandSection from './ExpandSection.vue'

export default Vue.extend({
  name: 'Question',
  inject: { builder },
  mixins: [FormQuestionsMixin],
  components: { Translation, QuestionHeader, QuestionParameters, QuestionChoices, QuestionConditions, ExpandSection },
  props: {
    value: Object as PropOptions<Question>,
  },
  data () {
    return {
      working: false,
      showParameters: this.value && !!this.value.questionParameters.length,
      showChoices: this.value.questionTypeId === questionTypes.multiple_choice || this.value.questionTypeId === questionTypes.multiple_select,
      showConditions: this.value && !!this.value.assignConditionTags.length,
    }
  },
  methods: {
    async updateQuestion () {
      if (this.working) return
      this.working = true
      this.showChoices = this.isChoiceType
      try {
        await builderService.updateQuestion(this.value)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
  },
  computed: {
    isChoiceType (): boolean {
      return this.value.questionTypeId === questionTypes.multiple_choice || this.value.questionTypeId === questionTypes.multiple_select
    },
  },
})
</script>

<style lang="sass">

.lowercase
  text-transform: lowercase
.question-content
  border: 1px solid lightgrey
</style>
