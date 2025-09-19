<script lang="ts" setup>
import { ref, computed } from 'vue'
import Question from './Question.vue'
import QuestionGroup from '@/entities/trellis/QuestionGroup'
import QuestionModel from '@/entities/trellis/Question'
import TCard from '../styles/TCard.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'
import builderService from '@/services/builder'
import PageSkips from './PageSkips.vue'
import ToggleItem from '@/components/util/ToggleItem.vue'
import ExpandSection from './ExpandSection.vue'
import SortableList, { Added, Moved } from '@/components/util/SortableList.vue'
import { logError } from '@/helpers/log.helper'
import { useBuilder, useBuilderQuestionList } from '@/helpers/builder.helper'
import BuilderChip from './BuilderChip.vue'

const props = defineProps<{
  value: QuestionGroup,
  index: number,
}>()

const emit = defineEmits<{
  (event: 'input', value: QuestionGroup): void
  (event: 'remove'): void
}>()

const working = ref(false)
const showSkips = ref(false)
const builder = useBuilder()
const questionsList = useBuilderQuestionList()

function getNextQuestionVarName () {
  const existing = questionsList.value.map(q => q.varName)
  let i = questionsList.value.length + 1
  let v = `q${i}`
  while (existing.includes(v)) {
    i++
    v = `q${i}`
  }
  return v
}

async function addQuestion () {
  if (working.value) return
  try {
    working.value = true
    const q = await builderService.createQuestion(props.value.id, {
      translated_text: '',
      var_name: getNextQuestionVarName(),
      question_type_id: builder.questionTypes[0].id,
      locale_id: builder.locale.id,
    })
    const pageQuestions = props.value
    pageQuestions.questions.push(q)
    emit('input', pageQuestions)
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

async function setRandomizeQuestions (randomize: boolean) {
  if (working.value) return
  try {
    working.value = true
    const sqg = props.value.sectionQuestionGroup
    sqg.randomizeQuestions = randomize
    await builderService.updateSectionQuestionGroup(sqg)
    emit('input', Object.assign({}, props.value, { sectionQuestionGroup: sqg }))
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

const randomizeQuestions = computed(() => props.value.sectionQuestionGroup.randomizeQuestions)

async function removeQuestion (question: QuestionModel) {
  if (working.value) return
  try {
    working.value = true
    await builderService.removeQuestion(question.id)
    const index = props.value.questions.indexOf(question)
    if (index >= 0) {
      const page = props.value
      page.questions.splice(index, 1)
      emit('input', page)
    }
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

async function duplicateQuestion (question: QuestionModel) {
  if (working.value) return
  try {
    working.value = true
    const q = await builderService.duplicateQuestion(props.value.id, question, getNextQuestionVarName())
    const page = props.value
    const index = page.questions.indexOf(question)
    if (index >= 0) {
      page.questions.splice(index + 1, 0, q)
    } else {
      page.questions.push(q)
    }
    emit('input', page)
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

async function questionMoved (e: Added<QuestionModel> | Moved<QuestionModel>) {
  e.element.questionGroupId = props.value.id
  e.element.sortOrder = e.newIndex
  working.value = true
  try {
    await builderService.updateQuestion(e.element)
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

</script>

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
        <BuilderChip
          :visible="!!randomizeQuestions"
          :locked="builder.locked"
          @click="setRandomizeQuestions(!randomizeQuestions)"
        >
          <v-icon left>
            mdi-shuffle
          </v-icon>
          {{ $t('randomized_order') }}
        </BuilderChip>
        <DotsMenu
          :disabled="builder.locked"
          removable
          @remove="$emit('remove')"
          class-name="page-handle"
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
          <v-list-item
            :disabled="builder.locked"
            @click="setRandomizeQuestions(!randomizeQuestions)"
          >
            <v-list-item-icon>
              <v-icon>mdi-shuffle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>{{ $t(randomizeQuestions ? 'disable_question_rand' : 'enable_question_rand') }}</v-list-item-content>
          </v-list-item>
        </DotsMenu>
      </v-row>
    </template>
    <ExpandSection
      v-model="showSkips"
      global
    >
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
      handle=".question-handle"
      @moved="questionMoved"
      @added="questionMoved"
    >
      <template #item="{ item: question, index }">
        <Question
          :key="question.id"
          v-model="value.questions[index]"
          @remove="removeQuestion(question)"
          @duplicate="duplicateQuestion(question)"
        />
      </template>
    </SortableList>
  </TCard>
</template>, refimport { useBuilder, useBuilderQuestions, useBuilderQuestionList } from '@/helpers/builder.helper'
