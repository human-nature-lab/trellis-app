<template>
  <v-layout class="skip-row" row align-center>
    <v-flex>
      <v-layout row wrap>
        <v-flex>
          <v-select
            dense
            solo
            :disabled="disabled"
            v-model="memSkip.showHide"
            :items="skipTypes" />
        </v-flex>
        <v-flex class="inline">
          this {{subject}} if {{scope}} has
        </v-flex>
        <v-flex>
          <v-select
            dense
            solo
            :disabled="disabled"
            v-model="memSkip.anyAll"
            :items="logicTypes"/>
        </v-flex>
        <v-flex class="inline">
          of these conditions:
        </v-flex>
        <v-flex>
          <TrellisLoadingCircle v-if="isLoading" />
          <v-select
            dense
            autocomplete
            solo
            deletable-chips
            chips
            multiple
            :disabled="disabled"
            v-show="!isLoading"
            :items="existingConditionTagNames"
            append-icon="add"
            :append-icon-cb="showCreateConditionTag"
            :value="selectedConditionTags"
            @input="updateConditionTags"/>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-spacer />
    <v-btn
      icon
      :disabled="isDirty || disabled"
      @click="remove()">
      <TrellisLoadingCircle v-if="isDirty" size="100%" />
      <v-icon v-else>delete</v-icon>
    </v-btn>
    <TrellisModal
      title="New condition tag"
      v-model="showConditionTag">
      <v-text-field
        label="Condition tag"
        v-model="conditionTagName"
        append-icon="add"
        :append-icon-cb="addConditionTag"
        />
    </TrellisModal>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Skip from '../../entities/trellis/Skip'
  import ConditionTag from '../../entities/trellis/ConditionTag'
  import TrellisLoadingCircle from '../TrellisLoadingCircle'
  import TrellisModal from '../TrellisModal'
  import debounce from 'lodash/debounce'
  import SkipConditionTag from '../../entities/trellis/SkipConditionTag'
  import CompareService from '../../services/CompareService'

  export default Vue.extend({
    name: 'SkipRow',
    components: { TrellisLoadingCircle, TrellisModal },
    props: {
      skip: Object as () => Skip,
      conditionTags: Array as () => ConditionTag[],
      scope: {
        type: String,
        default: 'respondent'
      },
      subject: {
        type: String,
        required: true
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        memSkip: this.skip.copy(),
        isDirty: false,
        showConditionTag: false,
        conditionTagName: null,
        skipTypes: [{
          text: 'Show',
          value: true
        }, {
          text: 'Hide',
          value: false
        }],
        logicTypes: [{
          text: 'any',
          value: true
        }, {
          text: 'all',
          value: false
        }],
        saveThrottled: null
      }
    },
    created () {
      this.saveThrottled = debounce(() => {
        console.log('emitting finalSave event')
        this.$emit('save', this.memSkip)
      }, 2000)
    },
    watch: {
      skip (newSkip) {
        console.log('Updating skip', newSkip)
        this.merge(newSkip)
        this.isDirty = false
      },
      memSkip: {
        handler (newSkip): void {
          console.log('modified memory copy of skip', newSkip)
          if (!CompareService.entitiesAreEqual(newSkip, this.skip) && newSkip.conditionTags.length) {
            console.log('mem copy is different from previous')
            this.isDirty = true
            this.saveThrottled(newSkip)
          } else {
            this.isDirty = false
          }
        },
        deep: true
      }
    },
    computed: {
      selectedConditionTags (): string[] {
        return this.memSkip.conditionTags.map(sct => sct.conditionTagName)
      },
      isLoading (): boolean {
        return Array.isArray(this.conditionTags) && !this.conditionTags.length
      },
      existingConditionTagNames (): string[] {
        return this.conditionTags.map(ct => ct.name).concat(this.selectedConditionTags)
      }
    },
    methods: {
      merge (newSkip: Skip) {
        this.memSkip = newSkip.copy()
      },
      showCreateConditionTag () {
        this.showConditionTag = true
        this.conditionTagName = ''
      },
      updateConditionTags (tags: string[]) {
        console.log('updating condition tags')
        if (tags.length > this.memSkip.conditionTags.length) {
          // Adding condition tags
          for (let name of tags) {
            if (this.selectedConditionTags.indexOf(name) === -1) {
              this.memSkip.conditionTags.push(new SkipConditionTag().fromSnakeJSON({
                condition_tag_name: name
              }))
            }
          }
        } else {
          // Removing condition tags
          for (let i = 0; i < this.memSkip.conditionTags.length; i++) {
            const tag = this.memSkip.conditionTags[i]
            if (tags.indexOf(tag.conditionTagName) === -1) {
              this.memSkip.conditionTags.splice(i, 1)
              i++
            }
          }
        }
      },
      addConditionTag () {
        this.memSkip.conditionTags.push(new SkipConditionTag().fromSnakeJSON({
          condition_tag_name: this.conditionTagName
        }))
        this.showConditionTag = false
      },
      remove () {
        this.$emit('remove')
      }
    }
  })
</script>

<style lang="sass">
  .skip-row
    .flex
      padding: 10px
    .inline
      padding-top: 22px
      text-align: center
</style>
