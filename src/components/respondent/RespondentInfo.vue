<template>
  <v-card tile>
    <v-toolbar card prominent>
      <v-toolbar-title>Respondent Info</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-alert v-if="error">
        {{error}}
      </v-alert>
      <v-container fluid>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <div slot="header">{{name}}</div>
            <v-card>
              <v-container fluid>
                <table class="table datatable">
                  <tr v-for="(name, index) in respondent.names" :key="name.id">
                    <td>{{name.name}}</td>
                    <td>
                      <span>
                        <v-btn
                          icon
                          @click="addNameModal = true">
                          <v-icon>add</v-icon>
                        </v-btn>
                         <v-btn
                           icon
                           @click="editingName = name; editNameModal = true">
                          <v-icon>edit</v-icon>
                        </v-btn>
                         <v-btn
                           icon
                           @click="removeName(index)">
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </span>
                    </td>
                  </tr>
                </table>
              </v-container>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-container>
      <h3>Photos</h3>
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <Photo
            v-for="photo in respondent.photos"
            :height="150"
            :width="150"
            :key="photo.id"
            :photo="photo"/>
          <v-flex
            v-ripple
            class="photo add-photo">
            <v-btn @click="isAddingPhoto = true">
              <v-icon>add</v-icon>
            </v-btn>
          </v-flex>
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
    <v-dialog
      v-model="isAddingPhoto"
      lazy>
      <v-container>
        <v-card>
          <v-btn @click="photoFromCamera">
            <v-icon>photo_camera</v-icon>
          </v-btn>
          <v-btn @click="photoFromFile">
            <v-icon>cloud_upload</v-icon>
          </v-btn>
        </v-card>
      </v-container>
    </v-dialog>
    <v-dialog
      v-model="addNameModal"
      lazy>
      <RespondentName
        :respondent="respondent"
        @close="doneAddingName"/>
    </v-dialog>
    <v-dialog
      v-model="editNameModal"
      lazy>
      <RespondentName
        :name="editingName"
        :respondent="respondent"
        @close="doneEditingName"/>
    </v-dialog>
  </v-card>
</template>

<script>
  import Photo from '../Photo'
  import RespondentName from './RespondentName'
  import RespondentService from '../../services/respondent/RespondentService'
  export default {
    name: 'respondent-info',
    props: {
      respondent: Object,
      newPhoto: Function
    },
    data () {
      return {
        error: null,
        editingName: null,
        isAddingPhoto: false,
        addNameModal: false,
        editNameModal: false
      }
    },
    methods: {
      photoFromCamera () {},
      photoFromFile () {},
      removeName (index) {
        let name = this.respondent.names[index]
        RespondentService.removeName(this.respondent.id, name.id).then(res => {
          this.respondent.names.splice(index, 1)
        }).catch(err => {
          this.error = err
        })
      },
      doneAddingName (name) {
        if (name) {
          this.respondent.names.push(name)
        }
        this.addNameModal = false
      },
      doneEditingName (name) {
        let oldIndex = this.respondent.names.findIndex(n => name.previous_respondent_name_id)
        this.respondent.names.splice(oldIndex, 1, [name])
        this.editNameModal = false
      }
    },
    computed: {
      name () {
        let rName = this.respondent.names.find(n => n.is_display_name)
        return rName ? rName.name : this.respondent.name
      }
    },
    components: {
      Photo,
      RespondentName
    }
  }
</script>

<style lang="sass" scoped>
  .table
    td
      &:first-child
        width: 100%
      &:last-child
        white-space: nowrap
  .add-photo
    width: 150px
    height: 150px
    flex-grow: 0
    button
      width: 100%
      height: 100%
</style>
