<template>
  <TCard elevation="1">
    <template #header>
      <v-row no-gutters class="pa-2 page-drag-handle align-center">
        <v-card-title>
          <span class="text-h6">{{ $t('page_n', builder.locale.languageTag, [index + 1]) }}</span>
        </v-card-title>
        <v-spacer />
        <v-chip
          class="mr-2"
          v-if="value.skips"
          @click="showSkips = !showSkips"
        >{{ $tc('skip_count', value.skips.length) }}</v-chip>
        <DotsMenu :disabled="builder.locked" removable @remove="$emit('remove')">
          <v-list-item @click="showSkips = !showSkips">
            <v-list-item-icon>
              <v-icon>mdi-eye</v-icon>
            </v-list-item-icon>
            <v-list-item-content>{{ $t('show_skips') }}</v-list-item-content>
          </v-list-item>
          <v-list-item :disabled="builder.locked" @click="addQuestion">
            <v-list-item-icon>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-content>{{ $t('add_question') }}</v-list-item-content>
          </v-list-item>
        </DotsMenu>
      </v-row>
      <v-progress-linear v-if="working" indeterminate />
    </template>
    <v-slide-y-transition>
      <v-col v-if="showSkips">
        <SkipRow
          v-for="(skip, index) in value.skips"
          :key="skip.id"
          v-model="value.skips[index]"
          :disabled="builder.locked"
          :conditionTags="builder.conditionTags"
        />

        <!-- <SkipEditor
          :disabled="builder.locked"
          :skips="value.skips"
          :conditionTags="builder.conditionTags"
          subject="page"
          :newSkip="newSkip"
          :deleteSkip="deleteSkip"
        />-->
      </v-col>
    </v-slide-y-transition>
    <!-- <draggable
        tag="div"
        class="px-4 pb-2 page-list"
        v-model="value.questions"
        handle=".question-drag-handle" 
        :group="{ name: 'questions' }"
    :animation="200">-->
    <Question
      v-for="(question, index) in value.questions"
      :key="question.id"
      v-model="value.questions[index]"
      @remove="removeQuestion(question)"
    />
    <!-- </draggable> -->
  </TCard>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import Question from './Question.vue'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import QuestionModel from '../../entities/trellis/Question'
import draggable from 'vuedraggable'
import SkipEditor from '../skips/SkipEditor.vue'
import SkipRow from './SkipRow.vue'
import TCard from '../styles/TCard.vue'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'
import builderService from '../../services/builder'

export default Vue.extend({
  name: 'Page',
  inject: { builder },
  components: { Question, draggable, SkipEditor, TCard, SkipRow, DotsMenu },
  props: {
    value: Object as PropOptions<QuestionGroup>,
    index: Number,
  },
  data() {
    return {
      working: false,
      showSkips: false,
    }
  },
  methods: {
    async addQuestion() {
      if (this.working) return
      try {
        this.working = true
        const q = await builderService.createQuestion(this.value.id, {
          translated_text: '',
          var_name: `q${this.value.questions.length + 1}`,
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
    async removeQuestion(question: QuestionModel) {
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
  }
})
</script>

<style lang="sass">

</style>