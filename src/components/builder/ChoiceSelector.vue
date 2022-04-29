<template>
  <v-select
    v-on="$listeners"
    :value="value"
    :label="$t('choice')"
    @input="$emit('input', $event)"
    :items="choices ? choices : qChoices"
    :disabled="disabled"
    :loading="loading"
    hide-details
    :item-value="itemValue"
  >
    <template #item="{ item }">
      <Translation :value="item.choiceTranslation" :locale="locale" />
    </template>
    <template #selection="{ item }">
      {{ item[itemValue] }}
    </template>
  </v-select>
</template>

<script lang="ts">
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import Vue, { PropType } from 'vue'
import Choice from '../../entities/trellis/Choice'
import Locale from '../../entities/trellis/Locale'
import Translation from './Translation.vue'

export default Vue.extend({
  name: "ChoiceSelector",
  props: {
    value: String,
    disabled: Boolean,
    loading: Boolean,
    choices: Array as PropType<Choice[]>,
    questionChoices: Array as PropType<QuestionChoice[]>,
    locale: Object as PropType<Locale>,
    itemValue: {
      type: String,
      default: "id"
    },
  },
  components: { Translation },
  computed: {
    qChoices (): Choice[] {
      return this.questionChoices.map(q => q.choice)
    }
  }
})
</script>

<style lang="sass">

</style>