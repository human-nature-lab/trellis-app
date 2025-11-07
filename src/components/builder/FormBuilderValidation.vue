<script lang="ts" setup>
import { computed, ref } from 'vue'
import Form from '@/entities/trellis/Form'
import Locale from '@/entities/trellis/Locale'
import singleton from '@/static/singleton'

type MissingTranslationError = {
  message: string
  localeId: string
  questionId?: string
  sectionId?: string
  pageId?: string
}

type DuplicateVarNameError = {
  message: string
  varName: string
  questionIds: string[]
}

type SkipIssueError = {
  message: string
  conditionTagName?: string
  pageId?: string
}

type ConditionAssignmentError = {
  message: string
  varName: string
  questionId: string
}

type FormValidationError =
  | MissingTranslationError
  | DuplicateVarNameError
  | SkipIssueError
  | ConditionAssignmentError

type TranslationTextEntry = {
  localeId?: string | null
  translatedText?: string | null
}

type TranslationEntity = {
  translationText?: TranslationTextEntry[]
}

type ErrorChip = {
  text: string
  color?: string
  textColor?: string
}

type DisplayError = {
  id: string
  message: string
  details?: string
  chips: ErrorChip[]
}

type ErrorGroup = {
  key: string
  title: string
  icon: string
  color: string
  description?: string
  items: DisplayError[]
}

const props = defineProps<{ builder: Record<string, unknown>; valid: boolean; errors: FormValidationError[] }>()

const builderForm = computed(() => props.builder?.form as Form | null)
const builderLocale = computed(() => props.builder?.locale as Locale | null)

const defaultLocaleId = computed(() => builderLocale.value?.id || singleton.study?.defaultLocaleId || null)

const localeLookup = computed(() => {
  const map = new Map<string, string>()
  const locales = singleton.study?.locales ?? []
  for (const locale of locales) {
    const label =
      locale.languageNative?.trim() ||
      locale.languageName?.trim() ||
      locale.languageTag?.trim() ||
      locale.id
    map.set(locale.id, label)
  }
  return map
})

function getLocaleLabel (localeId?: string) {
  if (!localeId) return null
  return localeLookup.value.get(localeId) || localeId
}

function pickTranslationText (translationEntity: TranslationEntity | null | undefined, localeId: string | null) {
  if (!translationEntity?.translationText?.length) {
    return ''
  }
  const texts = translationEntity.translationText
  if (localeId) {
    const matching = texts.find(tt => tt?.localeId === localeId && tt?.translatedText?.trim())
    if (matching?.translatedText) {
      return matching.translatedText.trim()
    }
  }
  const fallback = texts.find(tt => tt?.translatedText?.trim())
  return fallback?.translatedText?.trim() || ''
}

function findQuestionMeta (questionId?: string) {
  const form = builderForm.value
  if (!questionId || !form) return null
  for (let sectionIndex = 0; sectionIndex < form.sections.length; sectionIndex++) {
    const section = form.sections[sectionIndex]
    const sectionLabel = pickTranslationText(section?.nameTranslation, defaultLocaleId.value)
    for (let pageIndex = 0; pageIndex < section.pages.length; pageIndex++) {
      const page = section.pages[pageIndex]
      const question = page.questions.find(q => q.id === questionId)
      if (question) {
        const questionLabel =
          pickTranslationText(question.questionTranslation, defaultLocaleId.value) ||
          question.varName
        const questionIndex = page.questions.indexOf(question)
        const questionPosition = questionIndex > -1 ? questionIndex + 1 : question.sortOrder + 1
        const locationPieces = [
          `Section ${sectionIndex + 1}${sectionLabel ? `: ${sectionLabel}` : ''}`,
          `Page ${pageIndex + 1}`,
          `Question ${questionPosition}`,
        ]
        return {
          question,
          label: questionLabel,
          location: locationPieces.join(' · '),
          sectionLabel,
        }
      }
    }
  }
  return null
}

function findPageMeta (pageId?: string) {
  const form = builderForm.value
  if (!pageId || !form) return null
  for (let sectionIndex = 0; sectionIndex < form.sections.length; sectionIndex++) {
    const section = form.sections[sectionIndex]
    const sectionLabel = pickTranslationText(section?.nameTranslation, defaultLocaleId.value)
    for (let pageIndex = 0; pageIndex < section.pages.length; pageIndex++) {
      const page = section.pages[pageIndex]
      if (page.id === pageId) {
        const locationPieces = [
          `Section ${sectionIndex + 1}${sectionLabel ? `: ${sectionLabel}` : ''}`,
          `Page ${pageIndex + 1}`,
        ]
        return {
          page,
          label: `Page ${pageIndex + 1}`,
          location: locationPieces.join(' · '),
        }
      }
    }
  }
  return null
}

function sentenceCase (text: string) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

type QuestionMeta = NonNullable<ReturnType<typeof findQuestionMeta>>

const groupedErrors = computed<ErrorGroup[]>(() => {
  const groups = new Map<string, ErrorGroup>()

  const ensureGroup = (key: string, config: Omit<ErrorGroup, 'key' | 'items'>) => {
    const existing = groups.get(key)
    if (existing) {
      return existing
    }
    const created: ErrorGroup = {
      key,
      items: [],
      ...config,
    }
    groups.set(key, created)
    return created
  }

  const typedErrors = props.errors || []

  typedErrors.forEach((error, index) => {
    if ('localeId' in error) {
      const group = ensureGroup('missing-translations', {
        title: 'Missing translations',
        icon: 'mdi-translate',
        color: 'deep-orange darken-1',
        description: 'Add translations for the questions below:',
      })
      const localeLabel = getLocaleLabel(error.localeId)
      const questionMeta = 'questionId' in error ? findQuestionMeta(error.questionId) : null
      const questionVarName = questionMeta?.question?.varName
      const chips: ErrorChip[] = []
      if (localeLabel) {
        chips.push({
          text: localeLabel,
          color: 'orange lighten-5',
          textColor: 'orange darken-3',
        })
      }
      if (questionMeta?.label && questionMeta.label !== questionVarName) {
        chips.push({
          text: questionMeta.label,
          color: 'blue-grey lighten-5',
          textColor: 'blue-grey darken-2',
        })
      }
      group.items.push({
        id: `missing-${index}`,
        message: questionVarName
          ? `Add translation for question ${questionVarName}`
          : 'Add translation for this question',
        details: questionMeta?.location,
        chips,
      })
    } else if ('questionIds' in error) {
      const group = ensureGroup('duplicate-variables', {
        title: 'Duplicate variable names',
        icon: 'mdi-identifier',
        color: 'purple darken-2',
        description: 'Each question must have a unique variable name.',
      })
      const chips: ErrorChip[] = [
        {
          text: error.varName,
          color: 'purple lighten-5',
          textColor: 'purple darken-2',
        },
      ]
      const questionMetas = error.questionIds
        .map(id => findQuestionMeta(id))
        .filter((meta): meta is QuestionMeta => Boolean(meta))
      const locations = questionMetas.map(meta => `${meta.label} (${meta.location})`)
      group.items.push({
        id: `duplicate-${index}`,
        message: `Duplicate variable name "${error.varName}"`,
        details: locations.length ? locations.join('; ') : undefined,
        chips,
      })
    } else if ('questionId' in error && 'varName' in error) {
      const group = ensureGroup('condition-assignments', {
        title: 'Condition assignment issues',
        icon: 'mdi-function-variant',
        color: 'indigo darken-2',
        description: 'Update the assignment logic so it only references defined variables.',
      })
      const questionMeta = findQuestionMeta(error.questionId)
      const chips: ErrorChip[] = [
        {
          text: error.varName,
          color: 'indigo lighten-5',
          textColor: 'indigo darken-2',
        },
      ]
      if (questionMeta?.question?.varName && questionMeta.question.varName !== error.varName) {
        chips.push({
          text: `Question var: ${questionMeta.question.varName}`,
          color: 'grey lighten-4',
          textColor: 'grey darken-2',
        })
      }
      if (questionMeta?.label) {
        chips.push({
          text: questionMeta.label,
          color: 'blue-grey lighten-5',
          textColor: 'blue-grey darken-2',
        })
      }
      group.items.push({
        id: `assignment-${index}`,
        message: `Condition assignment references "${error.varName}" before it is defined`,
        details: questionMeta?.location,
        chips,
      })
    } else if ('pageId' in error) {
      const group = ensureGroup('skip-logic', {
        title: 'Skip logic warnings',
        icon: 'mdi-forwardburger',
        color: 'teal darken-2',
        description: 'Ensure skip logic uses condition tags that are defined earlier in the form.',
      })
      const pageMeta = findPageMeta(error.pageId)
      const chips: ErrorChip[] = []
      if ('conditionTagName' in error && error.conditionTagName) {
        chips.push({
          text: error.conditionTagName,
          color: 'teal lighten-5',
          textColor: 'teal darken-2',
        })
      }
      group.items.push({
        id: `skip-${index}`,
        message: sentenceCase(error.message),
        details: pageMeta?.location,
        chips,
      })
    } else {
      const group = ensureGroup('other', {
        title: 'Other validation issues',
        icon: 'mdi-alert-circle',
        color: 'red darken-2',
      })
      group.items.push({
        id: `other-${index}`,
        message: error.message,
        details: undefined,
        chips: [],
      })
    }
  })

  return Array.from(groups.values())
})

const totalErrors = computed(() => props.errors?.length ?? 0)

const summaryTitle = computed(() => {
  if (!totalErrors.value) {
    return ''
  }
  return totalErrors.value === 1
    ? '1 validation issue needs your attention'
    : `${totalErrors.value} validation issues need your attention`
})

const summaryDescription = computed(() => {
  if (!totalErrors.value) {
    return ''
  }
  return totalErrors.value === 1
    ? 'Resolve this problem to ensure the form works correctly.'
    : 'Resolve the problems below to ensure the form works correctly.'
})

const showAlert = computed(() => !props.valid && totalErrors.value > 0)
const isExpanded = ref(false)
</script>

<template>
  <v-alert
    v-if="showAlert"
    border="left"
    colored-border
    type="error"
    class="mb-6 validation-alert"
  >
    <div
      class="d-flex align-start cursor-pointer"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex-grow-1">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ summaryTitle }}
            </div>
            <div class="text-body-2">
              {{ summaryDescription }}
            </div>
          </div>
          <v-btn
            icon
            small
            @click.stop="isExpanded = !isExpanded"
          >
            <v-icon>
              {{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <v-expand-transition>
      <div v-if="isExpanded">
        <v-divider class="my-4" />
        <v-list
          dense
          class="transparent-list pa-0"
        >
          <div
            v-for="(group, groupIndex) in groupedErrors"
            :key="group.key"
            class="validation-group"
          >
            <v-subheader class="d-flex align-center">
              <v-icon
                left
                class="mr-2"
                :color="group.color"
              >
                {{ group.icon }}
              </v-icon>
              <span class="font-weight-medium">
                {{ group.title }}
              </span>
              <v-chip
                small
                label
                class="ml-2"
                :color="group.color"
                text-color="white"
              >
                {{ group.items.length }}
              </v-chip>
            </v-subheader>
            <div
              v-if="group.description"
              class="text-body-2 mb-2"
            >
              {{ group.description }}
            </div>
            <v-list-item
              v-for="item in group.items"
              :key="item.id"
              class="px-0 py-2"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ item.message }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="item.details">
                  {{ item.details }}
                </v-list-item-subtitle>
                <div
                  v-if="item.chips.length"
                  class="chip-group"
                >
                  <v-chip
                    v-for="chip in item.chips"
                    :key="chip.text"
                    small
                    outlined
                    label
                    class="mr-2 mb-2"
                    :color="chip.color"
                    :text-color="chip.textColor"
                  >
                    {{ chip.text }}
                  </v-chip>
                </div>
              </v-list-item-content>
            </v-list-item>
            <v-divider
              v-if="groupIndex < groupedErrors.length - 1"
              class="my-4"
            />
          </div>
        </v-list>
      </div>
    </v-expand-transition>
  </v-alert>
</template>

<style lang="sass" scoped>
.validation-alert
  .v-alert__content
    padding-top: 0
  .transparent-list
    background-color: transparent
  .v-subheader
    padding-left: 0
    padding-right: 0
    height: auto
    line-height: 1.375rem
  .chip-group
    display: flex
    flex-wrap: wrap
    margin-top: 4px
    margin-bottom: -4px
    & > *
      margin-right: 8px
      margin-bottom: 4px
  .cursor-pointer
    cursor: pointer
</style>
