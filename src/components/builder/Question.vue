<template>
  <v-col class="mb-4">
    <QuestionHeader
      :value="value"
      :showParameters.sync="showParameters"
      :showConditions.sync="showConditions"
      :showChoices.sync="showChoices"
      :allowChoices="isChoiceType"
      @change="updateQuestion"
      @remove="$emit('remove')"
      :loading="isWorking"
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
      <v-slide-y-transition>
        <QuestionChoices
          v-if="isChoiceType && showChoices"
          :questionId="value.id"
          :disabled="builder.locked"
          v-model="value.choices"
          :locale="builder.locale"
        />
      </v-slide-y-transition>
      <v-slide-y-transition>
        <QuestionParameters
          v-if="showParameters"
          :disabled="builder.locked"
          v-model="value.questionParameters"
          :parameters="builder.parameters"
          :conditionTags="builder.conditionTags"
          :locale="builder.locale"
          :geoTypes="builder.geoTypes"
          :questionId="value.id"
          :choices="value.choices"
        />
      </v-slide-y-transition>
      <v-slide-y-transition>
        <QuestionConditions
          v-if="showConditions"
          :questionId="value.id"
          :conditionTags="builder.conditionTags"
          :disabled="builder.locked"
          v-model="value.assignConditionTags"
        />
      </v-slide-y-transition>
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import Question from '../../entities/trellis/Question'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'
import Translation from './Translation.vue'
import EditText from './EditText.vue'
import QuestionHeader from './QuestionHeader.vue'
import QuestionParameters from './QuestionParameters.vue'
import { builder } from '../../symbols/builder'
import QuestionChoices from './QuestionChoices.vue'
import questionTypes from '../../static/question.types'
import QuestionConditions from './QuestionConditions.vue'

export default Vue.extend({
  name: 'Question',
  inject: { builder },
  mixins: [FormQuestionsMixin],
  components: { Translation, EditText, QuestionHeader, QuestionParameters, QuestionChoices, QuestionConditions },
  props: {
    value: Object as PropOptions<Question>,
  },
  data() {
    return {
      isWorking: false,
      showParameters: this.value && !!this.value.questionParameters.length,
      showChoices: this.value.questionTypeId === questionTypes.multiple_choice || this.value.questionTypeId === questionTypes.multiple_select,
      showConditions: this.value && !!this.value.assignConditionTags.length,
    }
  },
  methods: {
    async updateQuestion() {
      this.isWorking = true
      try {

      } finally {
        this.isWorking = false
      }
    }
  },
  computed: {
    isChoiceType(): boolean {
      return this.value.questionTypeId === questionTypes.multiple_choice || this.value.questionTypeId === questionTypes.multiple_select
    }
  }
})
</script>

<style lang="sass">

.lowercase
  text-transform: lowercase
.question-content
  border: 1px solid lightgrey
</style>