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
      v-if="!showConditions && value.assignConditionTags && value.assignConditionTags.length"
      color="white"
      class="black--text"
      label
      @click="$emit('update:showConditions', true)"
    >{{ $t('assigns_condition_tags', ['"' + value.assignConditionTags.map(act => act.conditionTag ? act.conditionTag.name : 'Unknown').join('","') + '"']) }}</v-chip>
    <v-chip
      v-if="!showParameters && value.questionParameters && value.questionParameters.length"
      color="white"
      @click="$emit('update:showParameters', !showParameters)"
    >{{ $tc('question_parameters_n', value.questionParameters.length) }}</v-chip>
    <DotsMenu :disabled="builder.locked" dark removable @remove="$emit('remove')">
      <v-list-item
        @click="$emit('update:showParameters', !showParameters)"
      >{{ $t(showParameters ? 'hide_parameters' : 'show_parameters') }}</v-list-item>
      <v-list-item
        @click="$emit('update:showConditions', !showConditions)"
      >{{ $t(showConditions ? 'hide_conditions' : 'show_conditions') }}</v-list-item>
      <v-list-item
        v-if="allowChoices"
        @click="$emit('update:showChoices', !showChoices)"
      >{{ $t(showChoices ? 'hide_choices' : 'show_choices') }}</v-list-item>
    </DotsMenu>
  </v-row>
</template>

<script lang="ts">
import Question from '../../entities/trellis/Question'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'
import MenuSelect from './MenuSelect.vue'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'

export default Vue.extend({
  name: 'QuestionHeader',
  inject: { builder },
  components: { EditText, MenuSelect, DotsMenu },
  props: {
    value: Object as PropType<Question>,
    loading: Boolean,
    showParameters: Boolean,
    showConditions: Boolean,
    showChoices: Boolean,
    allowChoices: Boolean,
  },
  methods: {
    updateQuestionType(typeId: string) {
      this.value.questionTypeId = typeId
      this.$emit('change', this.value)
    }
  }
})
</script>
