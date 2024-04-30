<template>
  <SkipEditor
    :value="value"
    subject="page"
    :drag-group="`page-skips-${pageId}`"
    @update="update"
    @remove="remove"
    @create="create"
    :condition-tags="conditionTags"
    :disabled="disabled"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import SkipEditor from '../skips/SkipEditor.vue'
import ConditionTag from '@/entities/trellis/ConditionTag'
import builderService from '@/services/builder'
import Skip from '@/entities/trellis/Skip'

export default Vue.extend({
  name: 'PageSkips',
  components: { SkipEditor },
  props: {
    value: Array as PropType<Skip[]>,
    disabled: Boolean,
    pageId: String,
    conditionTags: Array as PropType<ConditionTag[]>,
  },
  methods: {
    async update (skip: Skip, conditionTags?: string[], done: (err?: Error) => void) {
      console.log('update', skip, conditionTags)
      const index = this.value.indexOf(skip)
      try {
        const res = await builderService.updateSkip(skip, conditionTags)
        const v = this.value.slice()
        v[index] = res
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        done()
      }
    },
    async create (skip: Partial<Skip>, conditionTags?: string[], done: (err?: Error) => void) {
      console.log('create', skip, conditionTags)
      try {
        const tags = conditionTags ? conditionTags.map(t => ({ condition_tag_name: t })) : []
        const res = await builderService.createPageSkip(this.pageId, {
          show_hide: skip.showHide,
          any_all: skip.anyAll,
          precedence: this.value.length + 1,
          conditions: tags,
        })
        const v = this.value.slice()
        v.push(res)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        done()
      }
    },
    async remove (skip: Skip, done: (err?: Error) => void) {
      const index = this.value.indexOf(skip)
      try {
        await builderService.removePageSkip(skip.id)
        const v = this.value.slice()
        v.splice(index, 1)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        done()
      }
    },
  },
})
</script>

<style lang="sass">

</style>
