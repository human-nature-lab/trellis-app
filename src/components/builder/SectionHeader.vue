<template>
  <v-col class="pa-0">
    <v-row
      no-gutters
      class="align-center"
    >
      <v-icon @click="setVisible(!visible)">
        {{ visible ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      </v-icon>
      <div class="text-h6">
        <Translation
          v-model="section.nameTranslation"
          editable
          :locale="builder.locale"
          :locked="disabled || builder.locked"
        />
      </div>
      <v-spacer />
      <v-slide-x-transition>
        <v-chip
          v-if="!visible"
          @click="setVisible(true)"
        >
          {{ $tc('n_pages', pageCount) }}
        </v-chip>
      </v-slide-x-transition>
      <v-slide-x-transition>
        <v-chip
          v-if="!visible"
          @click="setVisible(true)"
        >
          {{ $tc('n_questions', questionCount) }}
        </v-chip>
      </v-slide-x-transition>
      <v-chip
        v-if="!showOptions && followUpId"
        @click="$emit('update:showOptions', true)"
      >
        {{
          $t('follow_up_to', builder.locale.languageTag, [questions[followUpId]
            ? questions[followUpId].varName : 'Loading...'])
        }}
      </v-chip>
      <v-chip
        v-if="!showOptions && isRepeatable"
        @click="$emit('update:showOptions', true)"
      >
        {{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}
      </v-chip>
      <DotsMenu
        :disabled="disabled || builder.locked"
        removable
        @remove="$emit('remove')"
      >
        <v-list-item
          :disabled="builder.locked"
          @click="$emit('addPage')"
        >
          <v-list-item-icon>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>{{ $t('add_page', builder.locale.languageTag) }}</v-list-item-content>
        </v-list-item>
        <ToggleItem
          :value="showOptions"
          @input="$emit('update:showOptions', $event)"
          :on-title="$t('hide_section_options')"
          :off-title="$t('show_section_options')"
        />
      </DotsMenu>
    </v-row>
    <ExpandSection
      :value="showOptions"
      @input="$emit('update:showOptions', $event)"
    >
      <v-row
        no-gutters
        class="px-2 align-center"
      >
        <MenuSelect
          :disabled="builder.locked"
          nullable
          @change="$emit('update:followUp', $event)"
          v-model="section.formSections[0].followUpQuestionId"
          :items="questionsList"
          item-value="id"
          class="mr-2"
          :label="$t('no_follow_up_question')"
          item-text="varName"
        />
        <v-checkbox
          v-if="followUpId"
          :disabled="builder.locked"
          @change="$emit('update:randomizeFollowUp', $event)"
          v-model="section.formSections[0].randomizeFollowUp"
          :label="$t('randomize_follow_up')"
        />
      </v-row>
    </ExpandSection>
  </v-col>
</template>

<script lang="ts">
import Section from '../../entities/trellis/Section'
import Vue, { PropOptions } from 'vue'
import Translation from './Translation.vue'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'
import ToggleItem from './ToggleItem.vue'
import MenuSelect from './MenuSelect.vue'
import ExpandSection from './ExpandSection.vue'

export default Vue.extend({
  name: 'SectionHeader',
  mixins: [FormQuestionsMixin],
  components: { Translation, DotsMenu, ToggleItem, MenuSelect, ExpandSection },
  inject: { builder },
  props: {
    section: Object as PropOptions<Section>,
    visible: Boolean,
    disabled: Boolean,
    showOptions: Boolean
  },
  methods: {
    setVisible (val: boolean) {
      this.$emit('update:visible', val)
    }
  },
  computed: {
    followUpId (): string {
      return this.section && this.section.formSections[0].followUpQuestionId
    },
    isRepeatable (): boolean {
      return this.section && this.section.formSections[0].isRepeatable
    },
    maxRepetitions (): number {
      return this.section && this.section.formSections[0].maxRepetitions
    },
    pageCount (): number {
      return this.section.pages.length
    },
    questionCount (): number {
      let count = 0
      for (let i = 0; i < this.section.pages.length; i++) {
        count += this.section.pages[i].questions.length
      }
      return count
    }
  }
})
</script>

<style lang="sass" scoped>

.v-chip
  margin-left: 3px
  margin-right: 3px
  .sticky
    top: 70px
    background: #f5f5f5
    z-index: 110
</style>
