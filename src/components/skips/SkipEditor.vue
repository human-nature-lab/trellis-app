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
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <SortableList
      v-if="conditionTags"
      :value="value"
      :disabled="true"
      :group="dragGroup"
      handle=".skip-drag-handle"
      @moved="movedSkip"
      @added="movedSkip"
    >
      <template #item="{ index, item: skip }">
        <SkipRow
          :key="skip.id"
          :allow-custom="allowCustom"
          v-model="value[index]"
          :disabled="disabled"
          :subject="subject"
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
      :subject="subject"
      :allow-custom="allowCustom"
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
import ConditionTag from '@/entities/trellis/ConditionTag'
import SkipRow from './SkipRow.vue'
import Skip from '@/entities/trellis/Skip'
import SortableList, { Added, Moved } from '@/components/util/SortableList.vue'

export default Vue.extend({
  name: 'SkipEditor',
  components: { SkipRow, SortableList },
  props: {
    value: Array as PropType<Skip[]>,
    disabled: Boolean,
    loading: Boolean,
    dragGroup: String,
    subject: String,
    allowCustom: Boolean,
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
      this.$emit('update', e.element)
    },
    update (skip: Skip, conditionTags?: ConditionTag[]) {
      console.log('update', skip, conditionTags)
      if (this.workingIndex >= 0) return
      this.workingIndex = this.value.indexOf(skip)
      this.$emit('update', skip, conditionTags, err => {
        this.workingIndex = -1
        if (err) {
          this.logError(err)
        }
      })
    },
    remove (skip: Skip) {
      if (this.workingIndex >= 0) return
      this.workingIndex = this.value.indexOf(skip)
      this.$emit('remove', skip, err => {
        this.workingIndex = -1
        if (err) {
          this.logError(err)
        }
      })
    },
    async create (skip: Partial<Skip>, conditionTags?: string[]) {
      console.log('create', skip, conditionTags)
      if (this.placeholderWorking) return
      this.placeholderWorking = true
      this.$emit('create', skip, conditionTags, err => {
        this.placeholder = null
        if (err) {
          this.logError(err)
        }
      })
    },
  },
})
</script>
