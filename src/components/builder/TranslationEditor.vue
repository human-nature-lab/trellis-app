<script setup lang="ts">
import { computed, ref } from 'vue'
import { logError } from '@/helpers/log.helper'
import Translation from '@/entities/trellis/Translation'
import TranslationText from '@/entities/trellis/TranslationText'
import Locale from '@/entities/trellis/Locale'
import ClickToEdit from '../ClickToEdit.vue'
import TranslationTextService from '@/services/translation-text'
import { format } from 'date-fns'

export type TranslationRow = {
  type: string
  ownerId: string
  varName?: string
  hasMissing?: boolean
  translation: Translation
}

const props = defineProps<{
  translations: TranslationRow[]
  onlyMissing?: boolean
  loading?: boolean
  showVarName?: boolean
}>()

const emit = defineEmits<{
  (event: 'update', value: TranslationText): void
  (event: 'create', value: TranslationText): void
}>()

const locales = computed<Locale[]>(() => {
  if (!props.translations.length) return []
  const res = []
  const t = props.translations[0].translation
  for (const tt of t.translationText) {
    res.push(tt.locale)
  }
  return res
})

type LocaleRow = Pick<TranslationRow, 'type' | 'ownerId' | 'hasMissing' | 'varName'> & {
  translationId: string
  translation: Record<string, TranslationText>
}

const translationRows = computed(() => {
  const rows: LocaleRow[] = []
  for (const t of props.translations) {
    if (props.onlyMissing && !t.hasMissing) continue
    const row = {
      type: t.type,
      ownerId: t.ownerId,
      varName: t.varName,
      hasMissing: t.hasMissing,
      translationId: t.translation.id,
      translation: {},
    }
    for (const tt of t.translation.translationText) {
      row.translation[tt.localeId] = tt
    }
    rows.push(row)
  }
  return rows
})

const workingOn = ref<string>(null)
async function updateTranslationText (t: LocaleRow, l: Locale, text: string) {
  workingOn.value = t.translationId
  try {
    if (t.translation[l.id]) {
      const updatedTt = await TranslationTextService.updateTranslatedTextById(t.translation[l.id].id, text)
      emit('update', updatedTt)
    } else {
      const tText = new TranslationText()
      tText.localeId = l.id
      tText.translationId = t.translationId
      tText.translatedText = text
      const newTT = await TranslationTextService.createTranslationText(tText.translationId, tText)
      emit('create', newTT)
    }
  } catch (err) {
    logError(err)
  } finally {
    workingOn.value = null
  }
}

const disabled = computed(() => {
  return !!workingOn.value || props.loading
})
</script>

<template>
  <v-simple-table>
    <thead>
      <tr>
        <th>{{ $t('type') }}</th>
        <th v-if="showVarName">
          {{ $t('var_name') }}
        </th>
        <th
          v-for="l in locales"
          :key="l.id"
        >
          {{ l.languageName }}
        </th>
        <th>
          {{  $t('last_updated') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="t in translationRows"
        :key="t.translationId"
        :class="{'primary': t.hasMissing}"
      >
        <td v-if="workingOn === t.translationId">
          <v-progress-circular
            indeterminate
            :size="30"
          />
        </td>
        <td v-else>
          {{ t.type }}
        </td>
        <td v-if="showVarName">
          {{ t.varName }}
        </td>
        <td
          v-for="l in locales"
          :key="`${t.translationId}-${l.id}`"
        >
          <ClickToEdit
            :value="t.translation[l.id] ? t.translation[l.id].translatedText : ''"
            :disabled="disabled"
            @save="updateTranslationText(t, l, $event)"
          />
        </td>
        <td>
          {{ t.translation[locales[0].id] ? format(t.translation[locales[0].id].updatedAt, 'MM/dd/yyyy hh:mm a') : '' }}
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>
