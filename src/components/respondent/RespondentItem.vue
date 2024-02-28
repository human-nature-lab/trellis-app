<script lang="ts" setup>
import { computed, ref } from 'vue'
import Photo from '../photo/Photo.vue'
import FullscreenPhoto from '../photo/FullscreenPhoto.vue'
import Respondent from '../../entities/trellis/Respondent'
import global from '../../static/singleton'
import ConditionTagDot from './ConditionTagDot.vue'

const props = defineProps<{
  formsButtonVisible: boolean,
  infoButtonVisible: boolean,
  respondent: Respondent,
  selected: boolean,
  labels: string[]
}>()

const emit = defineEmits<{
  (event: 'selected'): void
}>()

const showFullscreen = ref(false)

function onClick () {
  emit('selected')
}

const name = computed(() => {
  const noName = 'Unnamed Respondent'
  if (!props.respondent) {
    return noName
  } else if (props.respondent.names && props.respondent.names.length) {
    const rName = props.respondent.names.find(n => n.isDisplayName)
    return rName ? rName.name : props.respondent.name
  } else if (props.respondent.name) {
    return props.respondent.name
  } else {
    return noName
  }
})

const photo = computed(() => {
  return props.respondent && props.respondent.photos && props.respondent.photos.length ? props.respondent.photos[0] : null
})

</script>

<template>
  <v-flex
    xs6
    sm6
    md4
    lg3
    xl2
  >
    <v-card
      :ripple="{class: 'primary--text'}"
      :raised="selected === true"
      tile
      :class="{selected: selected === true, respondent: true, 'ma-1': true}"
    >
      <Photo
        class="respondent-photo"
        @click.capture.stop.prevent="onClick"
        :photo="photo"
      />
      <v-card-actions class="respondent-name">
        <v-col class="pa-0">
          <v-row
            no-gutters
            class="align-center"
          >
            <v-col
              cols="12"
              sm="auto"
              @click="onClick"
            >
              {{ name }}
            </v-col>
            <v-spacer />
            <v-col
              cols="12"
              sm="auto"
            >
              <v-btn
                :to="{name: 'RespondentForms', params: {studyId: global.study.id, respondentId: respondent.id}}"
                icon
              >
                <v-icon :large="$vuetify.breakpoint.smAndDown">
                  mdi-form-select
                </v-icon>
              </v-btn>
              <v-btn
                @click="showFullscreen = true"
                icon
              >
                <v-icon :large="$vuetify.breakpoint.smAndDown">
                  mdi-fullscreen
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            v-if="respondent.respondentConditionTags && respondent.respondentConditionTags.length"
            no-gutters
          >
            <ConditionTagDot
              v-for="tag in respondent.respondentConditionTags"
              :key="tag.id"
              :name="tag.conditionTag.name"
            />
          </v-row>
        </v-col>
      </v-card-actions>
      <v-card-text
        v-if="labels && labels.length"
      >
        <v-chip
          label
          outlined
          v-for="label in labels"
          :key="label"
        >
          {{ label }}
        </v-chip>
      </v-card-text>
    </v-card>
    <FullscreenPhoto
      :title="name"
      v-model="showFullscreen"
      :photo="photo"
    />
  </v-flex>
</template>

<style lang="sass">
  .respondent
    cursor: pointer
    &.selected
      background-color: orangered
      color: white
      margin: 2px
      box-shadow: 2px 2px 5px orangered
    .respondent-photo
      img
        max-width: 100%
        max-height: 100%
        pointer-events: none
</style>
