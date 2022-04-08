<template>
  <v-col class="ma-0 pa-0 relative">
    <v-row
      no-gutters
      class="blue-grey lighten-1 pa-4 white--text question-drag-handle align-center"
    >
      <MenuSelect
        :disabled="builder.locked || loading"
        v-model="value.questionTypeId"
        :items="builder.questionTypes"
        item-text="name"
        item-value="id"
        @change="updateQuestionType"
      />
      <EditText
        class="ml-2"
        v-model="value.varName"
        @save="updateVarName"
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
        <ToggleItem
          :value="showParameters"
          @input="$emit('update:showParameters', $event)"
          :onTitle="$t('hide_parameters')"
          :offTitle="$t('show_parameters')"
        />
        <ToggleItem
          :value="showConditions"
          @input="$emit('update:showConditions', $event)"
          :onTitle="$t('hide_conditions')"
          :offTitle="$t('show_conditions')"
        />
        <ToggleItem
          v-if="allowChoices"
          :value="showChoices"
          @input="$emit('update:showChoices', $event)"
          :onTitle="$t('hide_choices')"
          :offTitle="$t('show_choices')"
        />
      </DotsMenu>
    </v-row>
    <v-progress-linear :active="loading" indeterminate absolute bottom />
  </v-col>
</template>

<script lang="ts">
import Question from '../../entities/trellis/Question'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'
import MenuSelect from './MenuSelect.vue'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'
import ToggleItem from './ToggleItem.vue'

export default Vue.extend({
  name: 'QuestionHeader',
  inject: { builder },
  components: { EditText, MenuSelect, DotsMenu, ToggleItem },
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
    },
    updateVarName(varName: string) {
      this.value.varName = varName
      this.$emit('change', this.value)
    },
  }
})
</script>
