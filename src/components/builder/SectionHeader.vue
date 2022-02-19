<template>
  <v-row no-gutters class="align-bottom px-1">
    <div class="text-h6">
      <Translation v-model="section.nameTranslation" editable :locale="builder.locale" :locked="builder.locked" />
    </div>
    <v-spacer />
    <v-chip v-if="followUpId">{{ $t('follow_up_to', builder.locale.languageTag, [questions[followUpId] ? questions[followUpId].varName : 'Loading...']) }}</v-chip>
    <v-chip v-if="isRepeatable">{{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}</v-chip>
    <v-menu>
      <template #activator="{ attrs, on }">
        <v-btn icon text v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$emit('addPage')">{{ $t('add_page', builder.locale.languageTag) }}</v-list-item>
        <v-list-item>{{ $t('show_follow_up', builder.locale.languageTag) }}</v-list-item>
        <v-list-item>{{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}</v-list-item>
      </v-list>
    </v-menu>
  </v-row>
</template>

<script lang="ts">
import Section from '../../entities/trellis/Section'
import Vue, { PropOptions } from 'vue'
import Translation from './Translation.vue'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'
import { builder } from '../../symbols/builder'

export default Vue.extend({
  name: 'SectionHeader',
  mixins: [FormQuestionsMixin],
  components: { Translation },
  inject: { builder },
  props: {
    section: Object as PropOptions<Section>,
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