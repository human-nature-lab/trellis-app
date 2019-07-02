<template>
  <SkipEditor
    :newSkip="addFormSkip"
    :deleteSkip="deleteFormSkip"
    @update="skipUpdated"
    :conditionTags="respondentConditionTags"
    subject="form"
    :skips="form.skips" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import Form from "../../entities/trellis/Form"
  import Skip from "../../entities/trellis/Skip"
  import SkipEditor from '../skips/SkipEditor'
  import ConditionTag from "../../entities/trellis/ConditionTag"
  import ConditionTagService from '../../services/condition-tag'
  import SkipService from "../../services/skip"
  import FormSkip from "../../entities/trellis/FormSkip"

  export default Vue.extend({
    name: 'form-skips',
    components: {SkipEditor},
    props: {
      form: Object as () => Form
    },
    async created () {
      this.respondentConditionTags = await ConditionTagService.respondent()
    },
    data () {
      return {
        respondentConditionTags: [] as ConditionTag[]
      }
    },
    methods: {
      async addFormSkip (skip: Skip) {
        try {
          const formSkip: FormSkip = await SkipService.createFormSkip(this.form.id, skip)
          this.form.skips.push(formSkip.skip)
        } catch (err) {
          this.alert('error', 'Failed to create skip')
        }
      },
      async deleteFormSkip (skip: Skip) {
        try {
          await SkipService.deleteFormSkip(this.form.id, skip.id)
          const index = this.form.skips.findIndex(s => s.id === skip.id)
          this.form.skips.splice(index, 1)
        } catch (err) {
          this.alert('error', 'Failed to delete form skip')
        }
      },
      skipUpdated (skip: Skip) {
        const index = this.form.skips.findIndex(s => s.id === skip.id)
        this.form.skips.splice(index, 1, skip)
      }
    }
  })
</script>

<style scoped>

</style>
