<template>
  <v-col>
    <v-row
      no-gutters
      class="align-center"
    >
      <h4>{{ $t('skips') }}</h4>
      <v-spacer />
      <v-tooltip
        v-if="!disabled"
        left
      >
        <template #activator="{ on, attrs }">
          <v-btn
            @click="add"
            text
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_skip') }}
      </v-tooltip>
    </v-row>
    <SortableList
      :value="value"
      :disabled="true"
      :group="`page-skips-${pageId}`"
      handle=".page-skip-handle"
      @moved="movedSkip"
      @added="movedSkip"
    >
      <template #item="{ index, item: skip }">
        <SkipRow
          :key="skip.id"
          v-model="value[index]"
          :disabled="disabled"
          :condition-tags="conditionTags"
          @remove="remove(skip)"
          @change="update"
          @changeConditions="update"
          :loading="index === workingIndex"
        />
      </template>
    </SortableList>

    <SkipRow
      v-if="placeholder"
      :loading="placeholderWorking"
      v-model="placeholder"
      :disabled="disabled || placeholderWorking"
      :condition-tags="conditionTags"
      @change="create"
      @remove="placeholder = null"
      @changeConditions="create"
    />
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import ConditionTag from '../../entities/trellis/ConditionTag'
import SkipRow from './SkipRow.vue'
import builderService from '../../services/builder'
import Skip from '../../entities/trellis/Skip'
import SortableList, { Added, Moved } from './SortableList.vue'

export default Vue.extend({
  name: 'PageSkips',
  props: {
    value: Array as PropType<Skip[]>,
    disabled: Boolean,
    pageId: String,
    conditionTags: Array as PropType<ConditionTag[]>,
  },
  data () {
    return {
      placeholder: null as Partial<Skip>,
      placeholderWorking: false,
      workingIndex: -1,
    }
  },
  methods: {
    add () {
      this.placeholder = {
        showHide: true,
        anyAll: true,
        conditionTags: [],
      }
    },
    movedSkip (e: Moved<Skip> | Added<Skip>) {
      // TODO: this doesn't really work without knowing which collection the
      // skips belong to. We should probably change the schema to put the
      // precedence on the joining table (question_group_skip) instead.
      e.element.precedence = e.newIndex
      this.update(e.element)
    },
    async update (skip: Skip, conditionTags?: string[]) {
      console.log('update', skip, conditionTags)
      if (this.workingIndex >= 0) return
      this.workingIndex = this.value.indexOf(skip)
      try {
        const res = await builderService.updateSkip(skip, conditionTags)
        const v = this.value.slice()
        v[this.workingIndex] = res
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
    async create (skip: Partial<Skip>, conditionTags?: string[]) {
      console.log('create', skip, conditionTags)
      if (this.placeholderWorking) return
      this.placeholderWorking = true
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
        this.placeholder = null
      } catch (err) {
        this.logError(err)
      } finally {
        this.placeholderWorking = false
      }
    },
    async remove (skip: Skip) {
      if (this.workingIndex >= 0) return
      this.workingIndex = this.value.indexOf(skip)
      try {
        await builderService.removePageSkip(skip.id)
        const v = this.value.slice()
        v.splice(this.workingIndex, 1)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
  },
  components: { SkipRow, SortableList },
})
</script>

<style lang="sass">

</style>
