<template>
  <div>
    <v-menu
      v-if="!loading && hasHooks"
      offset-y
      left
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-on="on"
          v-bind="attrs"
        >
          Hooks
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="def, id in hooks"
          :key="id"
          @click="activeDef = def"
        >
          {{ def.name }}
        </v-list-item>
      </v-list>
    </v-menu>
    <TrellisModal
      :value="!!activeDef"
      :title="activeDef ? `Hook: ${activeDef.name}` : ''"
      @input="activeDef = null; activeResult = null;"
    >
      <v-col v-if="activeDef">
        <p v-if="activeDef.description">
          {{ activeDef.description }}
        </p>
        <v-simple-table v-if="activeDef.instances.length">
          <thead>
            <tr>
              <th>Id</th>
              <th>Instance Id</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inst in activeDef.instances"
              :key="inst.instance_id"
            >
              <td>{{ inst.id }}</td>
              <td>{{ inst.instance_id }}</td>
              <td :title="inst.finished_at">
                {{ inst.finished_at | relativeTime }}
              </td>
              <td>
                <v-btn @click="activeResult = inst">
                  Show Result
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
        <p v-else>
          This hook has never been executed
        </p>
        <v-slide-y-transition>
          <v-col v-if="activeResult">
            <pre><code>{{ activeResult }}</code></pre>
          </v-col>
        </v-slide-y-transition>
        <v-row
          no-gutters
          class="justify-end"
        >
          <v-btn
            color="success"
            :disabled="running || !hasPermission(TrellisPermission.ADD_SNAPSHOT)"
            :loading="running"
            @click="runHook(activeDef)"
          >
            Run
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </TrellisModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Hook } from '../../types/Hook'
import { HookService } from '../../services/hook'
import TrellisModal from '../TrellisModal.vue'
import { relativeTime } from '../../filters/relativeTime'
import PermissionMixin from '../../mixins/PermissionMixin'

export default Vue.extend({
  name: 'GeoHooks',
  components: { TrellisModal },
  filters: { relativeTime },
  mixins: [PermissionMixin],
  props: {
    geoId: String,
  },
  data () {
    return {
      loading: false,
      running: false,
      hasHooks: false,
      activeDef: null,
      activeResult: null,
      hooks: {} as Record<string, Hook>,
    }
  },
  watch: {
    geoId: {
      handler (newId: string, oldId: string) {
        if (newId !== oldId) {
          this.load()
        }
      },
      immediate: true,
    },
  },
  methods: {
    async load () {
      try {
        this.loading = true
        this.hooks = await HookService.geoHooks(this.geoId)
        this.hasHooks = !!Object.keys(this.hooks).length
      } catch (err) {
        this.logError(err)
      } finally {
        this.loading = false
      }
    },
    async runHook (def: Hook) {
      try {
        this.running = true
        await HookService.runGeoHook(this.geoId, def.id)
        this.alert('success', this.$t('success'))
        await this.load()
        this.activeDef = this.hooks[this.activeDef.id]
      } catch (err) {
        this.logError(err, err.response.data.msg)
      } finally {
        this.running = false
      }
    },
  },
})
</script>

<style lang="sass">

</style>
