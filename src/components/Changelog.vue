<template>
  <h1>Changelog</h1>
</template>

<script>
  import requireAll from "../classes/requireAll"

  const changelog =  requireAll(require.context('../../changelog/', true, /\.md$/))
  export default {
    name: 'Changelog'
  }
</script>

<style scoped>

</style>
