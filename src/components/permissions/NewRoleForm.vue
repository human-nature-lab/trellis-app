<template>
  <v-form v-model="isValid">
    <v-text-field
      :label="$t('name')"
      :rules="[required(), minLength(3)]"
      v-model="name" />
    <v-btn
      :disabled="!isValid"
      @click="save">
      {{$t('save')}}
    </v-btn>
  </v-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Role from '../../entities/trellis/Role'
  import ValidationMixin from '../../mixins/ValidationMixin'

  export default Vue.extend({
    name: 'NewRoleForm',
    mixins: [ValidationMixin],
    data () {
      return {
        name: '',
        isValid: false
      }
    },
    methods: {
      save () {
        const role = new Role()
        role.canDelete = true
        role.canEdit = true
        role.name = this.name
        if (this.isValid) {
          this.$emit('save', role)
        }
      }
    }
  })
</script>
