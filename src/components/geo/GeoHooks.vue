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
          {{ $t('hooks') }}
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="def, id in hooks"
          :key="id"
          @click="activeDef = def"
        >
          <v-list-item-icon>
            <v-icon v-text="def.icon || 'mdi-run'" />
          </v-list-item-icon>
          <v-list-item-content>{{ def.name }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <TrellisModal
      :value="!!activeDef"
      :title="activeDef ? `${activeDef.name}` : ''"
      @input="activeDef = null; activeResult = null;"
    >
      <v-col v-if="activeDef">
        <p v-if="activeDef.description">
          {{ activeDef.description }}
        </p>
        <v-simple-table v-if="activeDef.instances.length">
          <thead>
            <tr>
              <th>{{ $t('id') }}</th>
              <th>{{ $t('instance_id') }}</th>
              <th>{{ $t('started_at') }}</th>
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
                  {{ $t('show_result') }}
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
        <p v-else>
          {{ $t('hook_never_run') }}
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
            {{ $t('run_hook') }}
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </TrellisModal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Hook } from '../../types/Hook'
import { HookService } from '../../services/hook'
import TrellisModal from '../TrellisModal.vue'
import { relativeTime } from '../../filters/relativeTime'
import PermissionMixin from '../../mixins/PermissionMixin'
import Geo from '../../entities/trellis/Geo'

export default Vue.extend({
  name: 'GeoHooks',
  components: { TrellisModal },
  filters: { relativeTime },
  mixins: [PermissionMixin],
  props: {
    geo: Object as PropType<Geo>,
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
    geo: {
      handler (newGeo: Geo, oldGeo: Geo) {
        if (!oldGeo || newGeo.id !== oldGeo.id) {
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
        this.hooks = await HookService.geoHooks(this.geo.id)
        for (const id in this.hooks) {
          const hook = this.hooks[id]
          hook.instances = hook.instances.map(i => {
            if (i.result) {
              i.result = JSON.parse(i.result)
            }
            return i
          })
          if (hook.geoTypeId && hook.geoTypeId !== this.geo.geoTypeId) {
            delete this.hooks[id]
          }
        }
        this.hasHooks = !!Object.keys(this.hooks).length
      } catch (err) {
        this.alert('error', err, { timeout: 0 })
        this.logError(err)
      } finally {
        this.loading = false
      }
    },
    async runHook (def: Hook) {
      if (!confirm(this.$t('confirm_run_hook'))) {
        return
      }
      try {
        this.running = true
        await HookService.runGeoHook(this.geo.id, def.id)
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
