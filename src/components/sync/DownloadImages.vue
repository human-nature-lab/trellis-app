<template>

</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    name: 'DownloadImages',
    methods: {
      async runPipe<T, R> (input: T, pipe: Pipeline<T, R, Controller, DisplayStep>, displayGroup) {
      pipe.clearHooks()
      pipe.beforeEach.add((_, i) => {
        this.ctrl.onCancel.clear()
        this.activeStep = i
        const dStep = displayGroup.steps[i]
        dStep.status = 'running'
      })
      pipe.afterEach.add((input, output, i) => {
        this.progress.indeterminate = true
        this.progress.value = 1
        this.progress.total = 1
        const dStep = displayGroup.steps[i]
        console.log('res', input, output, dStep.name)
        dStep.status = 'success'
      })
      pipe.onError.add((err, i) => {
        const dStep = displayGroup.steps[i]
        dStep.status = 'error'
        dStep.message = {
          value: err.message,
        }
        this.running = false
      })
      return pipe.run(input, this.ctrl)
    },
    }
  })
</script>

<style lang="sass">
  
</style>