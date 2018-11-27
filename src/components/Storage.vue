<template>
    <v-flex>
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
                Backup database
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>
      <v-dialog lazy v-model="backup.isOpen" :persistent="backup.isWorking">
        <ModalTitle :title="'Database backup'" @close="closeBackup()" />
        <v-container>
          <v-card>
            <v-card-text>
              <span v-if="backup.isWorking">
                <v-progress-circular indeterminate /> Backing up database
              </span>
              <span v-else>
                <v-icon color="success">check</v-icon> Database backed up
              </span>
            </v-card-text>
          </v-card>
        </v-container>
      </v-dialog>
    </v-flex>
</template>

<script lang="ts">
  import ModalTitle from './ModalTitle'
  import Vue from 'vue'
  import BackupDatabase from '../services/upload/BackupDatabase'
  export default Vue.extend({
    components: {ModalTitle},
    name: 'Storage',
    data () {
      return {
        backup: {
          isOpen: false,
          isWorking: false,
          progress: 0
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
            if (progressCount % 100 === 0) {
              this.backup.progress = completed / total
            }
          })
          debugger
        } catch (err) {
          this.log(err)
          debugger
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
