<template>
  <v-col>
    <v-row
      no-gutters
      class="align-center"
    >
      <h4>{{ $t('choices') }}</h4>
      <v-spacer />
      <v-tooltip
        v-if="!disabled"
        left
      >
        <template #activator="{ on, attrs }">
          <v-btn
            @click="add"
            text
            icon
            :disabled="adding"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_choice') }}
      </v-tooltip>
    </v-row>
    <v-progress-linear
      v-if="adding"
      indeterminate
    />
    <SortableList
      :value="value"
      group="choices"
      @added="addExistingChoice"
      @moved="movedChoice"
    >
      <template #item="{ index }">
        <ChoiceRow
          v-model="value[index]"
          :locale="locale"
          :disabled="disabled"
          :loading="workingIndex === index"
          @remove="remove(choice)"
        />
      </template>
    </SortableList>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Locale from '../../entities/trellis/Locale'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import builder from '../../services/builder'
import ChoiceRow from './ChoiceRow.vue'
import SortableList, { Added, Moved } from './SortableList.vue'

export default Vue.extend({
  props: {
    disabled: Boolean,
    locale: Object as PropType<Locale>,
    questionId: String,
    value: Array as PropType<QuestionChoice[]>,
  },
  data () {
    return {
      adding: false,
      workingIndex: -1,
    }
  },
  methods: {
    async add () {
      try {
        this.adding = true
        const choice = await builder.createQuestionChoice(this.questionId)
        this.$emit('input', this.value.concat(choice))
      } catch (err) {
        this.logError(err)
      } finally {
        this.adding = false
      }
    },
    async addExistingChoice (d: Added<QuestionChoice>) {
      try {
        this.workingIndex = d.newIndex
        d.element.questionId = this.questionId
        d.element.sortOrder = d.newIndex
        await builder.addExistingQuestionChoice(d.element)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
    async movedChoice (d: Moved<QuestionChoice>) {
      console.log('moved', d)
      try {
        this.workingIndex = d.newIndex
        d.element.sortOrder = d.newIndex
        await builder.moveQuestionChoice(d.element)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
    async remove (choice: QuestionChoice) {
      if (this.workingIndex >= 0) return
      this.workingIndex = this.value.indexOf(choice)
      try {
        await builder.removeQuestionChoice(choice)
        const v = this.value.slice()
        v.splice(this.workingIndex, 1)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
  },
  components: { ChoiceRow, SortableList },
})

</script>
