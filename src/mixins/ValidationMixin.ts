import Vue from 'vue'
import Validators, { HasLength, Validator } from '../classes/Validators'

export default Vue.extend({
  methods: {
    minLength (min: number): Validator<HasLength> {
      return Validators.minLength(min, this.$t('min_length', [min]) as string)
    },
    maxLength (max: number): Validator<HasLength> {
      return Validators.maxLength(max, this.$t('max_length', [max]) as string)
    },
    required (): Validator<any> {
      return Validators.required(this.$t('required_field') as string)
    },
    email (): Validator<string> {
      return Validators.email(this.$t('valid_email') as string)
    }
  }
})
