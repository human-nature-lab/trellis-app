<template>
  <v-simple-table>
    <thead>
      <tr>
        <th>{{ $t('section') }}</th>
        <th>{{ $t('form') }}</th>
      </tr>
    </thead>
    <tr
      v-for="s in sections"
      :key="s.sectionId"
      class="section-row pointer"
      @click="$emit('select', s.sectionId)"
    >
      <td>
        <Translation
          :value="s.sectionTranslation"
          :locale="builder.locale"
        />
      </td>
      <td>
        <Translation
          :value="s.formTranslation"
          :locale="builder.locale"
        />
      </td>
    </tr>
    </v-list>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from 'vue'
import Translation from './Translation.vue'
import FormSection from '../../entities/trellis/FormSection'
import builderService from '../../services/builder'
import { builder } from '../../symbols/builder'
import { study } from '../../symbols/main'
import StudyForm from '../../entities/trellis/StudyForm'
import TranslationModel from 'src/entities/trellis/Translation'

type FS = {
  sectionId: string
  sectionTranslation: TranslationModel
  formTranslation: TranslationModel
}

export default Vue.extend({
  name: 'ExistingSectionSelector',
  components: { Translation },
  inject: { builder, study },
  data () {
    return {
      loading: false,
      studyForms: [] as StudyForm[],
    }
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.loading = true
      try {
        this.studyForms = await builderService.getStudyFormSections(this.study.id)
        console.log(this.studyForms)
      } catch (err) {
        this.logError(err)
      } finally {
        this.loading = false
      }
    },
  },
  computed: {
    sections () {
      const sections: FS[] = []
      for (const sf of this.studyForms) {
        if (sf.form) {
          for (const s of sf.form.sections) {
            sections.push({
              sectionId: s.id,
              sectionTranslation: s.nameTranslation,
              formTranslation: sf.form.nameTranslation,
            })
          }
        }
      }
      return sections
    },
  },
})
</script>

<style lang="sass" scoped>
  .section-row:hover
    background-color: grey
    color: white
</style>
