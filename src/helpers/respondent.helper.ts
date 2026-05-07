import { WatchSource, onBeforeUnmount, ref, watch } from 'vue'
import { debounce } from 'lodash'
import RespondentService from '@/services/respondent'
import Respondent from '@/entities/trellis/Respondent'
import PhotoService from '@/services/photo'
import { SearchFilter } from '@/services/respondent/RespondentServiceInterface'
import { RandomPagination, RandomPaginationResult } from '@/types/Pagination'

/**
 * @deprecated Use `SearchFilter` from `@/services/respondent/RespondentServiceInterface` instead.
 * This type historically diverged from `SearchFilter` (notably `geos: Geo[]` vs `string[]`).
 */
export type RespondentFilters = SearchFilter

export function useRespondent (id: WatchSource<string>) {
  const respondent = ref<Respondent | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  let lastId = null
  async function reload () {
    if (!lastId) return
    try {
      loading.value = true
      respondent.value = await RespondentService.getRespondentById(lastId)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  watch(id, (newId) => {
    if (newId !== lastId) {
      lastId = newId
      reload()
    }
  }, { immediate: true })
  return { respondent, error, loading, reload }
}

export function useRespondents (ids: string[]) {
  const respondents = ref<Respondent[]>([])
  const error = ref<Error | null>(null)
  const loading = ref(false)
  async function reload () {
    try {
      loading.value = true
      respondents.value = await Promise.all(ids.map(id => RespondentService.getRespondentById(id)))
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  reload()
  return { respondents, error, loading, reload }
}

export function watchRespondents (source: WatchSource<string[]>) {
  const respondents = ref<Record<string, Respondent>>({})
  const error = ref<Error | null>(null)
  const loading = ref(false)

  let pending = []
  async function loadPending (respondentIds: string[]) {
    const newRespondentIds = respondentIds.filter(id => !respondents.value[id] && !pending.includes(id))
    if (newRespondentIds.length === 0) return
    pending.push(...newRespondentIds)
    loading.value = true
    try {
      const newRespondents = await Promise.all(newRespondentIds.map(id => RespondentService.getRespondentById(id)))
      for (const r of newRespondents) {
        respondents.value[r.id] = r
      }
      respondents.value = { ...respondents.value }
      pending = pending.filter(id => !newRespondentIds.includes(id))
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  watch(source, loadPending, { immediate: true })

  return { respondents, error, loading }
}

export interface UseRespondentSearchOptions {
  studyId: WatchSource<string>
  query: WatchSource<string>
  filters: WatchSource<SearchFilter>
  pagination: WatchSource<RandomPagination>
  respondentId?: WatchSource<string | undefined>
  /** Debounce applied only to query changes. Defaults to 1000ms. */
  debounceMs?: number
}

/**
 * Reactive respondent search. Re-fetches whenever the studyId, query, filters,
 * pagination, or associated respondentId change. Only query changes are
 * debounced; filter and pagination changes fire immediately.
 *
 * The composable owns request ordering: out-of-order responses are dropped so
 * `results` always reflects the latest request. After each successful response
 * the input pagination's `seed` and `total` are mutated so that subsequent
 * pages re-use the same random seed.
 */
export function useRespondentSearch (options: UseRespondentSearchOptions) {
  const results = ref<Respondent[]>([])
  const total = ref(0)
  const seed = ref<number | string | undefined>(undefined)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let requestId = 0

  function readSource<T> (source: WatchSource<T>): T {
    return typeof source === 'function' ? (source as () => T)() : (source as { value: T }).value
  }

  async function load () {
    const myRequestId = ++requestId
    const studyId = readSource(options.studyId)
    if (!studyId) {
      results.value = []
      total.value = 0
      return
    }
    const query = readSource(options.query) || ''
    const filters = readSource(options.filters)
    const pagination = readSource(options.pagination)
    const respondentId = options.respondentId ? readSource(options.respondentId) : undefined

    loading.value = true
    PhotoService.cancelAllOutstanding()
    try {
      const page: RandomPaginationResult<Respondent> = await RespondentService.getSearchPage(
        studyId,
        query,
        filters,
        pagination,
        respondentId,
      )
      if (myRequestId !== requestId) return
      results.value = page.data
      total.value = page.total
      seed.value = page.seed
      pagination.seed = page.seed
      pagination.total = page.total
      error.value = null
    } catch (err) {
      if (myRequestId !== requestId) return
      error.value = err
    } finally {
      if (myRequestId === requestId) {
        loading.value = false
      }
    }
  }

  const debounceMs = options.debounceMs == null ? 1000 : options.debounceMs
  const debouncedLoad = debounceMs > 0 ? debounce(load, debounceMs) : load

  const stops = [
    watch(options.query, () => {
      loading.value = true
      debouncedLoad()
    }),
    watch(options.studyId, load, { immediate: true }),
    watch(options.filters, load, { deep: true }),
    watch(options.pagination, load, { deep: true }),
  ]
  if (options.respondentId) {
    stops.push(watch(options.respondentId, load))
  }

  onBeforeUnmount(() => {
    requestId++
    if (debouncedLoad !== load) {
      const cancel = (debouncedLoad as unknown as { cancel?: () => void }).cancel
      if (cancel) cancel()
    }
    for (const stop of stops) stop()
  })

  return { results, total, seed, loading, error, reload: load }
}
