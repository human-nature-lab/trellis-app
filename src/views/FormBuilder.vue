<template>
  <v-col class="grey lighten-3 min-h-screen">
    <v-row
      v-if="builder.form"
      no-gutters
      class="dheader align-center"
    >
      <div class="title">
        <Translation
          editable
          :locked="builder.locked"
          v-model="builder.form.nameTranslation"
          :locale="builder.locale"
        />
      </div>
      <v-spacer />
      <BuilderMenu
        class="mr-6"
        :locale.sync="builder.locale"
        :locked.sync="builder.locked"
        :form-id="builder.form.id"
        @addSection="addSection"
        @refresh="load"
      />
    </v-row>
    <v-progress-linear
      v-if="isLoading"
      indeterminate
    />
    <SortableList
      v-if="builder.form"
      :value="builder.form.sections"
      handle=".section-handle"
      @moved="sectionMoved"
      :disabled="builder.locked"
      tag="v-col"
    >
      <template #item="{ index, item: section }">
        <Section
          :key="section.id"
          v-model="builder.form.sections[index]"
          @remove="removeSection(section)"
        />
      </template>
    </SortableList>
    <v-col v-if="builder.form" />
  </v-col>
</template>

<script lang="ts">
import Form from '../entities/trellis/Form'
import SectionModel from '../entities/trellis/Section'
import Vue from 'vue'
import FormService from '../services/form/FormService'
import ConditionTagService from '../services/condition-tag'
import Section from '../components/builder/Section.vue'
import singleton from '../static/singleton'
import ConditionTag from '../entities/trellis/ConditionTag'
import QuestionType from '../entities/trellis/QuestionType'
import builderService from '../services/builder'
import Translation from '../components/builder/Translation.vue'
import BuilderMenu from '../components/builder/BuilderMenu.vue'
import { builder } from '../symbols/builder'
import { study } from '../symbols/main'
import Parameter from '../entities/trellis/Parameter'
import GeoType from '../entities/trellis/GeoType'
import GeoTypeService from '../services/geotype'
import SortableList, { Added, Moved } from '../components/builder/SortableList.vue'
import FormSection from 'src/entities/trellis/FormSection'

export default {
  name: 'FormBuilder',
  components: { Section, Translation, BuilderMenu, SortableList },
  data () {
    return {
      isLoading: true,
      builder: {
        form: null as Form,
        locale: singleton.locale ? singleton.locale.copy() : null,
        locked: true,
        questionTypes: [] as QuestionType[],
        parameters: [] as Parameter[],
        conditionTags: [] as ConditionTag[],
        geoTypes: [] as GeoType[],
      },
    }
  },
  provide () {
    return {
      [builder]: this.builder,
      [study]: Vue.observable(singleton.study),
    }
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.isLoading = true
      try {
        const [form, tags, questionTypes, parameters, geoTypes] = await Promise.all([
          FormService.getForm(this.$route.params.formId),
          ConditionTagService.all(),
          builderService.getQuestionTypes(),
          builderService.getParameterTypes(),
          GeoTypeService.allStudyGeoTypes(singleton.study.id),
        ])
        questionTypes.sort((a, b) => a.name.localeCompare(b.name))
        form.sort()
        parameters.sort((a, b) => a.name.localeCompare(b.name))
        tags.sort((a, b) => a.name.localeCompare(b.name))
        this.builder.form = form
        this.builder.questionTypes = questionTypes
        this.builder.conditionTags = tags
        this.builder.parameters = parameters
        this.builder.geoTypes = geoTypes
      } catch (err) {
        this.logError(err)
      } finally {
        this.isLoading = false
      }
    },
    async addSection () {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const section = await builderService.createSection(this.$route.params.formId, { sort_order: this.builder.form.sections.length })
        console.log(JSON.stringify(section))
        this.builder.form.sections.push(section)
      } catch (err) {
        this.logError(err)
      } finally {
        this.isLoading = false
      }
    },
    async removeSection (section: SectionModel) {
      this.isLoading = true
      try {
        await builderService.removeSection(section.id)
        const index = this.builder.form.sections.indexOf(section)
        if (index > -1) {
          this.builder.form.sections.splice(index, 1)
        }
      } catch (err) {
        this.logError(err)
      } finally {
        this.isLoading = false
      }
    },
    sectionMoved (e: Moved<SectionModel> | Added<SectionModel>) {
      const fs = e.element.formSections[0]
      fs.sortOrder = e.newIndex
      this.updateFormSection(fs)
    },
    async updateFormSection (s: FormSection) {
      try {
        this.isLoading = true
        await builderService.updateFormSection(s)
      } catch (err) {
        this.logError(err)
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style lang="sass" scoped>

.header
  background: #f5f5f5
  top: 0px
  z-index: 100
    // width: calc(100% - 10px)
</style>
