<template>
    <v-flex>
      <v-dialog v-model="backup.isOpen" :persistent="backup.isWorking">
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
                  <v-icon color="error">mdi-close</v-icon> {{$t('backup_failed')}}
                </div>
                <v-alert color="error" v-show="backup.error">
                  {{backup.error}}
                </v-alert>
              </v-flex>
              <v-flex v-else>
                <v-icon color="success">mdi-check</v-icon> {{$t('backup_success')}}
              </v-flex>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('storage') }}</v-toolbar-title>
        <v-spacer />
        <v-menu offset-y v-if="isCordova">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="backupDatabase">
              <v-list-item-action>
                <v-icon>mdi-cloud-upload</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                {{$t('backup_database')}}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>
    </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ModalTitle from '../components/ModalTitle.vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import BackupDatabase from '../services/upload/BackupDatabase'
  import FormatBytes from '../filters/format-bytes.filter'
  export default Vue.extend({
    components: { ModalTitle },
    mixins: [DocsLinkMixin('./admin/Storage.md')],
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
        this.backup.error = null
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
          console.error(err)
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
