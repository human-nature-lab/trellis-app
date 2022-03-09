<template>
  <v-col>
    <v-row no-gutters class="align-center">
      <h4>{{ $t('choices') }}</h4>
      <v-spacer />
      <v-tooltip v-if="!disabled" left>
        <template #activator="{ on, attrs }">
          <v-btn @click="add" text icon v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_choice') }}
      </v-tooltip>
    </v-row>
    <v-list>
      <v-list-item v-for="(choice, index) in value" :key="choice.id">
        <ChoiceRow
          v-model="value[index]"
          :locale="locale"
          :disabled="disabled"
          @remove="remove(choice)"
        />
      </v-list-item>
    </v-list>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Locale from '../../entities/trellis/Locale'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import Translation from './Translation.vue'
import builder from '../../services/builder'
import DotsMenu from './DotsMenu.vue'
import ChoiceRow from './ChoiceRow.vue'

export default Vue.extend({
  props: {
    disabled: Boolean,
    locale: Object as PropType<Locale>,
    questionId: String,
    value: Array as PropType<QuestionChoice[]>,
  },
  data() {
    return {
      working: false,
    }
  },
  methods: {
    async add() {
      const choice = await builder.createQuestionChoice(this.questionId)
      debugger
      this.$emit('input', this.value.concat(choice))
    },
    async remove(choice: QuestionChoice) {
      await builder.removeQuestionChoice(choice)
      const index = this.value.indexOf(choice)
      this.$emit('input', this.value.slice(0, index).concat(this.value.slice(index + 1)))
    },
  },
  components: { Translation, DotsMenu, ChoiceRow }
})

</script>