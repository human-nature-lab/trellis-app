<template>
  <v-col>
    <SkipEditor
      :value="value.skips"
      subject="form"
      :loading="!respondentConditionTags"
      :drag-group="`form-skips-${value.id}`"
      @update="update"
      @remove="remove"
      @create="create"
      :condition-tags="respondentConditionTags"
    />
    <v-row no-gutters>
      <v-spacer />
      <v-btn
        class="mb-2 mr-2"
        @click="$emit('close')"
      >
        Done
      </v-btn>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import Form from '../../entities/trellis/Form'
import Skip from '../../entities/trellis/Skip'
import SkipEditor from '../skips/SkipEditor.vue'
import ConditionTagService from '../../services/condition-tag'
import SkipService from '../../services/skip'
import TitleCase from '../../filters/TitleCase'
import SkipConditionTag from '@/entities/trellis/SkipConditionTag'

export default Vue.extend({
  name: 'FormSkips',
  components: { SkipEditor },
  filters: { TitleCase },
  props: {
    value: Object as () => Form,
  },
  created () {
    this.loadConditionTags()
  },
  data () {
    return {
      respondentConditionTags: null,
    }
  },
  methods: {
    async loadConditionTags () {
      try {
        this.respondentConditionTags = await ConditionTagService.respondent()
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    async update (skip: Skip, conditionTags?: string[], done: (err?: Error) => void) {
      console.log('update', skip, conditionTags)
      const index = this.value.skips.indexOf(skip)
      try {
        if (conditionTags) {
          skip.conditionTags = conditionTags.map(t =>
            new SkipConditionTag().fromSnakeJSON({ condition_tag_name: t }),
          )
        }
        const res = await SkipService.updateSkip(skip)
        const f = this.value.copy()
        f.skips[index] = res
        this.$emit('input', f)
      } catch (err) {
        this.logError(err)
      } finally {
        done()
      }
    },
    async create (skip: Partial<Skip>, conditionTags?: string[], done?: (err?: Error) => void) {
      console.log('create', skip, conditionTags)
      try {
        if (conditionTags) {
          skip.conditionTags = conditionTags.map(t =>
            new SkipConditionTag().fromSnakeJSON({ condition_tag_name: t }),
          )
        }
        const tSkip = new Skip()
        Object.assign(tSkip, skip, {
          precedence: this.value.skips.length + 1,
        })
        const res = await SkipService.createFormSkip(this.value.id, tSkip)
        const f = this.value.copy()
        f.skips.push(res)
        this.$emit('input', f)
      } catch (err) {
        this.logError(err)
      } finally {
        if (done) {
          done()
        }
      }
    },
    async remove (skip: Skip, done: (err?: Error) => void) {
      const index = this.value.skips.indexOf(skip)
      try {
        await SkipService.deleteFormSkip(this.value.id, skip.id)
        const f = this.value.copy()
        f.skips.splice(index, 1)
        this.$emit('input', f)
      } catch (err) {
        this.logError(err)
      } finally {
        done()
      }
    },
  },
})
</script>
