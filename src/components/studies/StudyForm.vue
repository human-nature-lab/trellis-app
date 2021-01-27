<template>
  <v-form v-model="isValid" ref="form">
    <v-container>
      <v-layout column>
        <v-flex>
          <v-text-field
            :disabled="isWorking"
            :label="$t('name')"
            :rules="nameRules"
            required
            v-model="memStudy.name" />
        </v-flex>
        <v-flex>
          <v-layout>
            <v-flex xs9>
              <v-slider
                :disabled="isWorking"
                :step="1"
                max="100"
                min="20"
                :label="$t('photo_quality')"
                v-model="memStudy.photoQuality" />
            </v-flex>
            <v-flex xs3>
              <v-text-field
                v-model="memStudy.photoQuality"
                max="100"
                min="20"
                type="number"
                step="5" />
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex>
          <v-select
            autocomplete
            required
            :rules="defaultLocaleRules"
            :disabled="isWorking"
            v-model="memStudy.defaultLocaleId"
            :loading="!locales.length"
            :items="locales"
            item-value="id"
            item-text="languageName"
            :label="$t('default_language')" />
        </v-flex>
        <v-flex>
          <v-layout>
            <v-spacer />
            <v-btn
              @click="resetMemcopy(study)"
              :disabled="isWorking">
              {{$t('clear')}}
            </v-btn>
            <v-btn
              @click="save"
              :disabled="isWorking || !isValid">
              <TrellisLoadingCircle v-if="isWorking" size="30px" />
              <span v-else>{{$t('save')}}</span>
            </v-btn>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Locale from '../../entities/trellis/Locale'
  import Study from '../../entities/trellis/Study'
  import ValidationMixin from '../../mixins/ValidationMixin'
  import CompareService from '../../services/CompareService'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  export default Vue.extend({
    name: 'StudyForm',
    components: { TrellisLoadingCircle },
    mixins: [ValidationMixin],
    props: {
      study: Study,
      isWorking: {
        type: Boolean,
        default: false
      },
      locales: {
        type: Array as () => Locale[],
        required: true
      }
    },
    data () {
      return {
        isValid: false,
        memStudy: null,
        nameRules: [this.minLength(1)],
        defaultLocaleRules: [this.required()]
      }
    },
    watch: {
      study (newStudy) {
        this.resetMemcopy(newStudy)
      }
    },
    created () {
      this.resetMemcopy(this.study)
    },
    methods: {
      resetMemcopy (newStudy: Study) {
        if (newStudy) {
          this.memStudy = newStudy.copy()
        } else {
          const s = new Study()
          s.name = ''
          s.defaultLocaleId = null
          s.defaultLocale = null
          s.photoQuality = 100
          this.$set(this, 'memStudy', s)
        }
      },
      save () {
        if (CompareService.entitiesAreEqual(this.memStudy, this.study)) {
          this.alert('info', this.$t('resource_is_same', [this.$t('study')]))
        } else if (this.isValid && this.$refs.form && this.$refs.form.validate()) {
          this.$emit('save', this.memStudy)
        }
      }
    }
  })
</script>
