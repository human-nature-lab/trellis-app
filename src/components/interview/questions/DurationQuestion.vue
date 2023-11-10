<script setup lang="ts">
import { computed } from 'vue'
import PT from '@/static/parameter.types'
import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'

const props = defineProps<{
  question: Question
  disabled?: boolean
  respondent: Respondent
  location: Location
}>()

const format = computed(() => {
  const qd = props.question.questionParameters.find(qp => qp.parameterId === PT.duration_format)
  if (!qd) return 'HH:mm:ss'
  return qd.val
})

</script>

<template>
  <v-col>
    Duration Question
  </v-col>
</template>

<style lang="sass">

</style>
