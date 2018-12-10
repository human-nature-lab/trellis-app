<template>
  <h1>Documentation</h1>
</template>

<script>
  import requireAll from "../classes/requireAll"
  const docs = requireAll(require.context('../../docs/', true, /\.md$/))

  export default {
    name: 'Documentation'
  }
</script>

<style scoped>

</style>
