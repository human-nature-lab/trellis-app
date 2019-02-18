<template>
  <v-layout column class="full-width-col">
    <v-card v-for="skip in sortedSkips">
      <SkipRow
        :conditionTags="conditionTags"
        :subject="subject"
        @save="updateSkip"
        @remove="removeSkip(skip)"
        :skip="skip" />
    </v-card>
    <v-card>
      <SkipRow
        v-if="showNewSkip"
        :conditionTags="conditionTags"
        :disabled="lockNewSkip"
        @save="storeNewSkip"
        @remove="removeNewSkip"
        :subject="subject"
        :skip="tempSkip" />
    </v-card>
    <v-flex>
      <v-btn
        @click="addSkip">
        <v-icon>add</v-icon> {{$t('add_skip')}}
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Skip from '../../entities/trellis/Skip'
  import SkipRow from './SkipRow'
  import ConditionTag from "../../entities/trellis/ConditionTag"
  import SkipService from '../../services/skip'
  export default Vue.extend({
    name: 'SkipEditor',
    components: {SkipRow},
    props: {
      skips: Array as () => Skip[],
      conditionTags: Array as () => ConditionTag[],
      subject: {
        type: String,
        required: true
      },
      newSkip: {
        type: Function as () => Function,
        required: true
      },
      deleteSkip: {
        type: Function as () => Function,
        required: true
      }
    },
    data () {
      return {
        showNewSkip: false,
        lockNewSkip: false,
        tempSkip: new Skip()
      }
    },
    methods: {
      addSkip () {
        this.tempSkip = new Skip()
        this.tempSkip.showHide = true
        this.tempSkip.anyAll = true
        this.tempSkip.conditionTags = []
        this.tempSkip.precedence = this.skips.length + 1
        this.showNewSkip = true
      },
      async storeNewSkip (newSkip: Skip) {
        this.lockNewSkip = true
        await this.newSkip(newSkip)
        this.lockNewSkip = false
        this.showNewSkip = false
        // this.showNewSkip = false
      },
      async updateSkip (skip: Skip) {
        skip = await SkipService.updateSkip(skip)
        this.$emit('update', skip)
      },
      async removeSkip (skip: Skip) {
        await this.deleteSkip(skip)
      },
      async removeNewSkip () {
        this.showNewSkip = false
      }
    },
    computed: {
      sortedSkips (): Skip[] {
        return this.skips.sort((a, b) => a.precedence - b.precedence)
      }
    }
  })
</script>

<style lang="sass" scoped>
  .full-width-col
    min-width: 100%
  .card
    margin: 5px 2px 10px 2px
</style>
