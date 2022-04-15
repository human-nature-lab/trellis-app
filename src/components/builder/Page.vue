<template>
  <TCard
    elevation="1"
    :loading="working"
  >
    <template #header>
      <v-row
        no-gutters
        class="px-2 py-1 page-drag-handle align-center"
      >
        <v-card-title>
          <span class="text-h6">{{ $t('page_n', builder.locale.languageTag, [index + 1]) }}</span>
        </v-card-title>
        <v-spacer />
        <v-chip
          class="mr-2"
          v-if="value.skips && value.skips.length && !showSkips"
          @click="showSkips = !showSkips"
        >
          {{ $tc('skip_count', value.skips ? value.skips.length : 0) }}
        </v-chip>
        <DotsMenu
          :disabled="builder.locked"
          removable
          @remove="$emit('remove')"
        >
          <ToggleItem
            v-model="showSkips"
            :on-title="$t('hide_skips')"
            :off-title="$t('show_skips')"
          />
          <v-list-item
            :disabled="builder.locked"
            @click="addQuestion"
          >
            <v-list-item-icon>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-content>{{ $t('add_question') }}</v-list-item-content>
          </v-list-item>
        </DotsMenu>
      </v-row>
    </template>
    <ExpandSection v-model="showSkips">
      <PageSkips
        v-if="showSkips"
        v-model="value.skips"
        :page-id="value.id"
        :disabled="builder.locked"
        :condition-tags="builder.conditionTags"
      />
    </ExpandSection>
    <SortableList
      :value="value.questions"
      group="questions"
      :disabled="builder.locked"
      tag="div"
      @moved="questionMoved"
      @added="questionMoved"
    >
      <template #item="{ item: question, index }">
        <Question
          :key="question.id"
          v-model="value.questions[index]"
          @remove="removeQuestion(question)"
        />
      </template>
    </SortableList>
  </TCard>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import Question from './Question.vue'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import QuestionModel from '../../entities/trellis/Question'
import TCard from '../styles/TCard.vue'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'
import builderService from '../../services/builder'
import PageSkips from './PageSkips.vue'
import ToggleItem from './ToggleItem.vue'
import ExpandSection from './ExpandSection.vue'
import SortableList, { Added, Moved } from './SortableList.vue'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'

export default Vue.extend({
  name: 'Page',
  inject: { builder },
  components: { Question, TCard, DotsMenu, PageSkips, ToggleItem, ExpandSection, SortableList },
  mixins: [FormQuestionsMixin],
  props: {
    value: Object as PropOptions<QuestionGroup>,
    index: Number,
  },
  data () {
    return {
      working: false,
      showSkips: false,
    }
  },
  methods: {
    async addQuestion () {
      if (this.working) return
      try {
        this.working = true
        const q = await builderService.createQuestion(this.value.id, {
          translated_text: '',
          var_name: `q${this.questionsList.length + 1}`,
          question_type_id: this.builder.questionTypes[0].id,
          locale_id: this.builder.locale.id,
        })
        this.value.questions.push(q)
        this.$emit('input', this.value)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    async removeQuestion (question: QuestionModel) {
      if (this.working) return
      try {
        this.working = true
        await builderService.removeQuestion(question.id)
        const index = this.value.questions.indexOf(question)
        if (index >= 0) {
          this.value.questions.splice(index, 1)
          this.$emit('input', this.value)
        }
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    async questionMoved (e: Added<QuestionModel> | Moved<QuestionModel>) {
      e.element.questionGroupId = this.value.id
      e.element.sortOrder = e.newIndex
      this.working = true
      try {
        await builderService.updateQuestion(e.element)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
  },
})
</script>

<style lang="sass">

</style>
