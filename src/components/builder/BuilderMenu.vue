<script lang="ts" setup>
import { inject, ref } from 'vue'
import { study as studySymbol } from '@/symbols/main'
import Locale from '@/entities/trellis/Locale'
import LocaleSelectorMenu from '@/components/locale/LocaleSelectorMenu.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'
import expandAllBus from '@/events/builder/expandAll'
import FormService from '@/services/form'
import Study from '@/entities/trellis/Study'

const study = inject<Study>(studySymbol)

const props = defineProps<{
  locked: boolean
  locale: Locale
  formId: string
}>()

const emit = defineEmits<{
  (event: 'update:locked', value: boolean): void
  (event: 'update:locale', value: Locale): void
  (event: 'add-section'): void
  (event: 'add-existing-section'): void
  (event: 'refresh'): void
}>()

const openLocales = ref(false)
const expandAll = ref(false)

function updateLocale (newLocale: Locale) {
  console.log('update locale', newLocale)
  openLocales.value = false
  emit('update:locale', newLocale)
}

function toggleExpandAll () {
  expandAll.value = !expandAll.value
  expandAllBus.$emit('change', expandAll.value)
}

function exportForm () {
  FormService.exportForm(props.formId)
}

</script>

<template>
  <DotsMenu>
    <v-list>
      <v-list-item @click="$emit('update:locked', !locked)">
        <v-list-item-action>
          <v-icon v-if="locked">
            mdi-lock
          </v-icon>
          <v-icon v-else>
            mdi-lock-open-variant
          </v-icon>
        </v-list-item-action>
        {{ locked ? $t('locked') : $t('unlocked') }}
      </v-list-item>
      <v-list-item @click="toggleExpandAll">
        <v-list-item-action>
          <v-icon v-if="expandAll">
            mdi-arrow-expand-vertical
          </v-icon>
          <v-icon v-else>
            mdi-arrow-expand-vertical
          </v-icon>
        </v-list-item-action>
        <v-list-item-content>
          {{ expandAll ? $t('close_all') : $t('expand_all') }}
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        @click="$emit('add-section')"
        :disabled="locked"
      >
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
        {{ $t('add_section') }}
      </v-list-item>
      <v-list-item
        :disabled="locked"
        @click="$emit('add-existing-section')"
      >
        <v-list-item-action>
          <v-icon>
            mdi-vector-link
          </v-icon>
        </v-list-item-action>
        <v-list-item-content>
          {{ $t('add_existing_section') }}
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{ name: 'FormTranslations', params: { formId } }">
        <v-list-item-action>
          <v-icon>mdi-translate</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          {{ $t('edit_translations') }}
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'InterviewPreview', params: { formId } }"
        target="_blank"
      >
        <v-list-item-action>
          <v-icon>mdi-open-in-new</v-icon>
        </v-list-item-action>
        <v-list-item-content>{{ $t('preview_form') }}</v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'FormPrint', params: { formId } }"
        target="_blank"
      >
        <v-list-item-action>
          <v-icon>mdi-open-in-new</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          {{ $t('print_form') }}
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="exportForm">
        <v-list-item-action>
          <v-icon>mdi-export</v-icon>
        </v-list-item-action>
        <v-list-item-content>{{ $t('export_form') }}</v-list-item-content>
      </v-list-item>
      <LocaleSelectorMenu
        :value="locale"
        @input="updateLocale"
        :study-id="study.id"
      >
        <template #activator="{ attrs, on }">
          <v-list-item
            v-bind="attrs"
            v-on="on"
          >
            <v-list-item-action>
              <v-icon>mdi-web</v-icon>
            </v-list-item-action>
            <v-list-item-content>{{ $t('change_locale') }}</v-list-item-content>
          </v-list-item>
        </template>
      </LocaleSelectorMenu>
      <v-list-item @click="$emit('refresh')">
        <v-list-item-action>
          <v-icon>mdi-refresh</v-icon>
        </v-list-item-action>
        <v-list-item-content>{{ $t('refresh') }}</v-list-item-content>
      </v-list-item>
    </v-list>
  </DotsMenu>
</template>
