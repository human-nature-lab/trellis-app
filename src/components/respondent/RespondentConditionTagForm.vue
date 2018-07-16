<template>

</template>

<script>
  import {now} from '../../services/DateService'
  export default {
    name: 'respondent-condition-form',
    props: {
      respondentId: {
        type: String,
        required: true
      },
      conditionTag: {
        type: Object,
        default: () => ({
          respondent_id: this.respondentId,
          updated_at: now(),
          created_at: now()
        })
      }
    },
    methods: {
      done () {
        this.$emit('close', this.conditionTag)
      }
    }
  }
</script>

<style scoped>

</style>
