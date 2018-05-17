<template>
  <v-flex xs12 sm6 md4 lg3 xl2>
    <v-card
      :raised="selected === true"
      tile
      :class="{selected: selected === true, respondent: true}">
      <v-card-media class="respondent-photo"
                    @click="onClick()">
        <Photo :photo="respondent.photos[0]" width="150" height="150"></Photo>
      </v-card-media>
      <v-card-text class="respondent-name"
                   @click="onClick()">
        {{respondent.name}}
        <!--<v-btn @click="onClick">Select</v-btn>-->
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <button icon
                @click="showInfo = true">
          <v-icon>info</v-icon>
        </button>
      </v-card-actions>
    </v-card>
    <v-dialog
      lazy
      v-model="showInfo"
      transition="dialog-bottom-transition"
      scrollable>
      <v-card tile>
        <v-toolbar card color="primary">
          <v-btn icon @click.native="showInfo = false" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{respondent.name}}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <h3>Photos</h3>
          <v-container fluid grid-list-md>
            <v-layout row wrap>
              <Photo
                v-for="photo in respondent.photos"
                :height="100"
                :width="100"
                :key="photo.id"
                :photo="photo"/>
              <v-btn @click="photoFromCamera">
                <v-icon size="100">photo_camera</v-icon>
              </v-btn>
              <v-btn @click="photoFromFile">
                <v-icon size="100">cloud_upload</v-icon>
              </v-btn>
            </v-layout>
          </v-container>
          <h3>Condition Tags</h3>
          <v-data-table
            hide-actions
            :headers="[{
              text: 'Tag name',
              value: 'name'
            }, {
              text: 'Last updated',
              value: 'updated_at'
            }, {
              text: 'Created at',
              value: 'created_at'
            }]"
            :items="respondent.respondent_condition_tags">
            <template slot="items" slot-scope="props">
              <td>{{ props.item.name }}</td>
              <td class="text-xs-right">{{ props.item.updated_at }}</td>
              <td class="text-xs-right">{{ props.item.created_at }}</td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
  import Photo from './Photo'
  export default {
    name: 'respondent',
    props: {
      respondent: {
        type: Object,
        required: true
      },
      selected: {
        type: Boolean
      }
    },
    data: function () {
      return {
        showInfo: false
      }
    },
    methods: {
      onClick: function () {
        this.$emit('selected')
      },
      photoFromFile: function () {

      },
      photoFromCamera: function () {

      }
    },
    components: {
      Photo
    }
  }
</script>

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
