<template>
  <v-col class="print-question pa-0 mb-2">
    <v-row no-gutters class="primary pa-2">
      <h6 class="text-h6">
        <span v-if="showNumbers" class="mr-1">{{number + 1}}.</span>
        <span :title="$t('var_name')+''">{{question.varName}}</span>
      </h6>
      <v-spacer />
      <span :title="$t('question_type')+''">{{ $t('type') }}: {{question.questionType.name}}</span>
    </v-row>
    <v-col class="pa-4">
      <v-row no-gutters>
        <pre 
          v-if="isCode(question)" 
          class="code"
          language="html"><code>{{translate(question.questionTranslation, locale)}}</code></pre>
        <div v-else>
          {{translate(question.questionTranslation, locale)}}
        </div>
      </v-row>
      <ul v-if="showChoices && question.questionType.name === 'multiple_choice'">
        <v-radio
          v-for="choice in question.choices"
          :key="choice.id"
          :label="translate(choice.choice.choiceTranslation, locale)" />
      </ul>
      <ul v-if="showChoices && question.questionType.name === 'multiple_select'">
        <v-checkbox
          class="checkbox"
          v-for="choice in question.choices"
          :key="choice.id"
          single-line
          dense
          :label="translate(choice.choice.choiceTranslation, locale)" />
      </ul>
      <v-row no-gutters v-if="showParameters && question.questionParameters.length">
        <span class="mr-2">{{ $t('parameters') }}: </span>
        <v-chip v-for="parameter in question.questionParameters" :key="parameter.id" label small class="mr-2">
          {{parameter.parameter.name}}: {{parameter.val}}
        </v-chip>
      </v-row>
      <v-row no-gutters v-if="showConditions && question.assignConditionTags.length">
        <span class="mr-2">{{ $t('assigns_conditions') }}: </span>
        <v-chip v-for="act in question.assignConditionTags" :key="act.id" label small class="mr-2">
          {{act.scope}}: {{act.conditionTag.name}}  
        </v-chip>
      </v-row>
    </v-col>
  </v-col>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Locale from '../../entities/trellis/Locale'
  import Question from '../../entities/trellis/Question'
  import TranslateMixin from '../../mixins/TranslateMixin'

  export default Vue.extend({
    name: 'Question',
    mixins: [TranslateMixin],
    props: {
      question: Object as PropOptions<Question>,
      locale: Object as PropOptions<Locale>,
      number: Number,
      showNumbers: Boolean,
      showChoices: Boolean,
      showParameters: Boolean,
      showConditions: Boolean,
    },
    methods: {
      isCode (question: Question): boolean {
        const translated = this.translate(question.questionTranslation, this.locale)
        return translated.trim().startsWith('<')
      }
    }
  })
</script>

<style lang="sass">
  .print-question
    page-break-inside: avoid
    ul
      margin-top: 10px
    .checkbox
      margin-top: 0
      padding-top: 0
      .v-messages
        height: 0
        min-height: 0
</style>
