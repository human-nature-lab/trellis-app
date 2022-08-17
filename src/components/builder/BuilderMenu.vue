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
        @click="$emit('addSection')"
        :disabled="locked"
      >
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
        {{ $t('add_section') }}
      </v-list-item>
      <v-list-item
        :disabled="locked"
        @click="$emit('addExistingSection')"
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
      <v-list-item
        :to="{ name: 'InterviewPreview', params: { formId: formId } }"
        target="_blank"
      >
        <v-list-item-action>
          <v-icon>mdi-open-in-new</v-icon>
        </v-list-item-action>
        <v-list-item-content>{{ $t('preview_form') }}</v-list-item-content>
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

<script lang="ts">
import Vue, { PropType } from 'vue'
import { study } from '@/symbols/main'
import Locale from '@/entities/trellis/Locale'
import LocaleSelectorMenu from '@/components/locale/LocaleSelectorMenu.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'
import expandAll from '@/events/builder/expandAll'
import FormService from '@/services/form'
import TrellisModal from '@/components/TrellisModal.vue'
import ExistingSectionSelector from './ExistingSectionSelector.vue'

export default Vue.extend({
  name: 'BuilderMenu',
  inject: { study },
  components: { LocaleSelectorMenu, DotsMenu, TrellisModal, ExistingSectionSelector },
  props: {
    locked: Boolean,
    locale: Object as PropType<Locale>,
    formId: String,
  },
  data () {
    return {
      openLocales: false,
      expandAll: false,
      showSectionSelector: false,
    }
  },
  methods: {
    updateLocale (newLocale: Locale) {
      console.log('update locale', newLocale)
      this.$emit('update:locale', newLocale)
    },
    toggleExpandAll () {
      this.expandAll = !this.expandAll
      expandAll.$emit('change', this.expandAll)
    },
    exportForm () {
      FormService.exportForm(this.formId)
    },
  },
})
</script>

<style lang="sass">

</style>
