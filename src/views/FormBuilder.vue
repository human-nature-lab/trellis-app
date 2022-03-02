<template>
  <v-col class="grey lighten-3 min-h-screen">
    <v-row v-if="builder.form" no-gutters class="dheader align-center">
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
        @addSection="addSection"
        @refresh="load"
      />
    </v-row>
    <v-progress-linear v-if="isLoading" indeterminate />
    <v-col v-else>
      <Section
        v-for="(section, index) in builder.form.sections"
        :key="section.id"
        v-model="builder.form.sections[index]"
      />
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Form from '../entities/trellis/Form'
import Vue from 'vue'
import FormService from '../services/form/FormService'
import ConditionTagService from '../services/condition-tag'
import Section from '../components/builder/Section.vue'
import singleton from '../static/singleton'
import ConditionTag from '../entities/trellis/ConditionTag'
import QuestionType from '../entities/trellis/QuestionType'
import FormBuilderService from '../services/builder'
import TrellisModal from '../components/TrellisModal.vue'
import Translation from '../components/builder/Translation.vue'
import BuilderMenu from '../components/builder/BuilderMenu.vue'
import { builder } from '../symbols/builder'
import { study } from '../symbols/main'
import Parameter from '../entities/trellis/Parameter'
import GeoType from '../entities/trellis/GeoType'
import GeoTypeService from '../services/geotype'

export default Vue.extend({
  name: 'FormBuilder',
  components: { Section, TrellisModal, Translation, BuilderMenu },
  data() {
    return {
      isLoading: false,
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
  provide() {
    return {
      [builder]: this.builder,
      [study]: Vue.observable(singleton.study),
    }
    // const p = {}
    // Object.defineProperties(p, {
    //   [form]: {
    //     enumerable: true,
    //     get: () => this.form,
    //   },
    //   [study]: {
    //     enumerable: true,
    //     get: () => singleton.study,
    //   },
    //   [locale]: {
    //     enumerable: true,
    //     get: () => this.locale,
    //   },
    //   [builder]: {
    //     enumerable: true,
    //     get: () => this.builder,
    //   },
    //   [questionTypes]: {
    //     enumerable: true,
    //     get: () => this.questionTypes,
    //   },
    //   [conditionTags]: {
    //     enumerable: true,
    //     get: () => this.conditionTags,
    //   },
    // })
    // return p
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.isLoading = true
      try {
        const [form, tags, questionTypes, parameters, geoTypes] = await Promise.all([
          FormService.getForm(this.$route.params.formId),
          ConditionTagService.all(),
          FormBuilderService.getQuestionTypes(),
          FormBuilderService.getParameterTypes(),
          GeoTypeService.allStudyGeoTypes(singleton.study.id),
        ])
        questionTypes.sort((a, b) => a.name.localeCompare(b.name))
        form.sort()
        parameters.sort((a, b) => a.name.localeCompare(b.name))
        this.builder.form = form
        this.builder.questionTypes = questionTypes
        this.builder.conditionTags = tags
        this.builder.parameters = parameters
        this.builder.geoTypes = geoTypes
      } catch (err) {
        this.alert('error', err)
      } finally {
        this.isLoading = false
      }
    },
    async addSection() {
      this.isLoading = true
      try {
        const section = await FormService.createSection(this.$route.params.formId)
        this.builder.form.sections.push(section)
      } finally {
        this.isLoading = false
      }
    }
  },
})
</script>

<style lang="sass" scoped>
 .header
    background: #f5f5f5
    top: 0px
    z-index: 100
    // width: calc(100% - 10px)
</style>