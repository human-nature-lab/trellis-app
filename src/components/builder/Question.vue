<template>
  <v-col class="mb-4">
    <QuestionHeader
      :value="value"
      :showParameters.sync="showParameters"
      @change="updateQuestion"
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
    </v-col>
    <v-slide-y-transition>
      <QuestionParameters
        v-if="showParameters"
        :disabled="builder.locked"
        v-model="value.questionParameters"
        :parameters="builder.parameters"
      />
    </v-slide-y-transition>
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

export default Vue.extend({
  name: 'Question',
  inject: { builder },
  mixins: [FormQuestionsMixin],
  components: { Translation, EditText, QuestionHeader, QuestionParameters },
  props: {
    value: Object as PropOptions<Question>,
  },
  data() {
    return {
      isWorking: false,
      showParameters: true,
      showChoices: true,
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
  }
})
</script>

<style lang="sass">

.lowercase
  text-transform: lowercase
.question-content
  border: 1px solid lightgrey
</style>