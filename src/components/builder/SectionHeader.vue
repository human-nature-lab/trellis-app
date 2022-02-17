<template>
  <v-row no-gutters class="align-center">
    <Translation v-model="section.nameTranslation" :locale="locale" editable />
    <v-spacer />
    <v-chip v-if="followUpId">{{ $t('follow_up_to', questions[followUpId].varName) }}</v-chip>
    <v-chip v-if="isRepeatable">{{ $tc('repeated', maxRepetitions) }}</v-chip>
    <v-menu>
      <template #activator="{ attrs, on }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$emit('addPage')">{{ $t('add_page') }}</v-list-item>
        <v-list-item>{{ $t('follow_up') }}</v-list-item>
        <v-list-item>{{ $t('repeated') }}</v-list-item>
      </v-list>
    </v-menu>
  </v-row>
</template>

<script lang="ts">
import Section from '../../entities/trellis/Section'
import Vue, { PropOptions } from 'vue'
import Locale from '../../entities/trellis/Locale'
import Translation from './Translation.vue'

export default Vue.extend({
  name: 'SectionHeader',
  components: { Translation },
  props: {
    section: Object as PropOptions<Section>,
    locale: Object as PropOptions<Locale>,
    questions: Object,
  },
  computed: {
    followUpId(): string {
      return this.section && this.section.formSections[0].followUpQuestionId
    },
    isRepeatable(): boolean {
      return this.section && this.section.formSections[0].isRepeatable
    },
    maxRepetitions(): number {
      return this.section && this.section.formSections[0].maxRepetitions
    }
  }
})
</script>

<style lang="sass">

</style>