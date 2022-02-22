<template>
  <v-row no-gutters class="blue-grey lighten-1 pa-4 white--text question-drag-handle align-center">
    <MenuSelect
      :disabled="builder.locked || loading"
      v-model="value.questionTypeId"
      :items="builder.questionTypes"
      item-text="name"
      item-value="id"
    />
    <EditText
      class="ml-2"
      v-model="value.varName"
      @save="$emit('change', value)"
      editable
      :locked="builder.locked"
      :disabled="loading"
    />
    <v-spacer />
    <v-chip
      v-if="value.assignConditionTags && value.assignConditionTags.length"
      color="white"
      class="black--text"
      label
    >{{ $t('assigns_condition_tags', ['"' + value.assignConditionTags.map(act => act.conditionTag.name).join('","') + '"']) }}</v-chip>
    <v-chip
      v-if="value.questionParameters && value.questionParameters.length"
      color="white"
      @click="$emit('update:showParameters', !showParameters)"
    >{{ $tc('question_parameters_n', value.questionParameters.length) }}</v-chip>
  </v-row>
</template>

<script lang="ts">
import Question from '../../entities/trellis/Question'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'
import MenuSelect from './MenuSelect.vue'
import { builder } from '../../symbols/builder'

export default Vue.extend({
  name: 'QuestionHeader',
  inject: { builder },
  components: { EditText, MenuSelect, },
  props: {
    value: Object as PropType<Question>,
    loading: Boolean,
    showParameters: Boolean,
  },
  methods: {
    updateQuestionType(typeId: string) {
      this.value.questionTypeId = typeId
      this.$emit('change', this.value)
    }
  }
})
</script>
