<template>
    <v-flex>
      <v-dialog lazy v-model="backup.isOpen" :persistent="backup.isWorking">
        <ModalTitle title="Backup" @close="closeBackup()" />
        <v-card>
          <v-card-text>
            <v-container>
              <v-layout v-if="backup.isWorking">
                <v-progress-circular color="primary" :value="backup.progress" />
                <v-flex>
                  {{$t('backup_working')}} {{backup.progressMsg}}
                </v-flex>
              </v-layout>
              <v-flex v-else-if="backup.error">
                <div>
                  <v-icon color="error">close</v-icon> {{$t('backup_failed')}}
                </div>
                <v-alert color="error" v-show="backup.error">
                  {{backup.error}}
                </v-alert>
              </v-flex>
              <v-flex v-else>
                <v-icon color="success">check</v-icon> {{$t('backup_success')}}
              </v-flex>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('storage') }}</v-toolbar-title>
        <v-spacer />
        <v-menu offset-y v-if="isCordova">
          <v-btn icon slot="activator">
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile @click="backupDatabase">
              <v-list-tile-action>
                <v-icon>cloud_upload</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                {{$t('backup_database')}}
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile @click="eatSnack">
              <v-list-tile-action>
                <v-icon>snack</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                Eat snack
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>
    </v-flex>
</template>

<script lang="ts">
  import ModalTitle from './ModalTitle'
  import Vue from 'vue'
  import BackupDatabase from '../services/upload/BackupDatabase'
  import FormatBytes from "../filters/format-bytes.filter"
  export default Vue.extend({
    components: {ModalTitle},
    name: 'Storage',
    data () {
      return {
        backup: {
          isOpen: false,
          isWorking: false,
          progress: 0,
          progressMsg: '',
          error: null
        }
      }
    },
    methods: {
      async backupDatabase () {
        this.backup.isOpen = true
        this.backup.isWorking = true
        this.backup.progress = 0
        try {
          let progressCount = 0
          await BackupDatabase((completed: number, total: number) => {
            progressCount++
            if (progressCount % 10 === 0) {
              this.backup.progress = (completed / total) * 100
              this.backup.progressMsg = `${FormatBytes(completed)} / ${FormatBytes(total)}`
              console.log('progress', this.backup.progress)
            }
          })
        } catch (err) {
          this.log(err)
          this.backup.error = err.exception
        } finally {
          this.backup.isWorking = false
        }
      },
      closeBackup () {
        if (this.backup.isWorking) return
        else this.backup.isOpen = false
      }
    }
  })
</script>

<style scoped>

</style>
