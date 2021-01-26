<template>
  <v-menu
    v-if="editable || removable"
    offset-x
    max-width="60px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-on="on" v-bind="attrs">
        <v-icon>more_vert</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        @click="$emit('edit')"
        v-if="editable">
        <v-icon>edit</v-icon>
      </v-list-item>
      <v-list-item
        @click="$emit('remove')"
        v-if="removable">
        <v-icon color="error">delete</v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    name: 'CRUDMenu',
    props: {
      editable: {
        type: Boolean,
        default: true
      },
      removable: {
        type: Boolean,
        default: true
      }
    }
  })
</script>
