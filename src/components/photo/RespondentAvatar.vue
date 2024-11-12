<script setup lang="ts">
import { computed } from 'vue'
import Respondent from '@/entities/trellis/Respondent'
import personPlaceholder from '@/assets/baseline-person-24px.svg'
import Photo from './Photo.vue'

const props = defineProps<{
  respondent: Respondent
  respondentId?: string
}>()

const displayPhoto = computed(() => props.respondent.photos.length ? props.respondent.photos[0] : null)
</script>

<template>
  <v-avatar>
    <Photo
      v-if="displayPhoto"
      :photo="displayPhoto"
      is-contained
      is-centered
    />
    <v-img
      v-else
      :src="personPlaceholder"
    />
  </v-avatar>
</template>

<style lang="sass">

</style>

