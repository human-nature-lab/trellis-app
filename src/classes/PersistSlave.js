import throttle from 'lodash/throttle'
import cloneDeep from 'lodash/cloneDeep'
export default class PersistSlave {
  /**
   * A class that is responsible for syncing up an external source with the supplied data
   * @param {Object} store - The datastore. Needs to emit a 'change' event when data changes that needs to be persisted
   * @param {PersistSlave~stateExtractor} stateExtractorCb
   * @param {PersistSlave~saveCallback} saveCb
   * @param {PersistSlave~shouldSaveCallback} shouldSaveCb
   * @param {Number} [throttleRate = 3000] - How often to make call the save function
   * @param {Number} [maxFailures = 5] - The number of failures before we consider the persisting to have failed critically
   */
  constructor (store, stateExtractorCb, saveCb, shouldSaveCb, throttleRate = 3000, maxFailures = 5) {
    this.lastPersistedState = null
    this.hasNewData = false
    this.store = store
    this.stateExtractor = stateExtractorCb
    this.saveCb = saveCb
    this.shouldSaveCb = shouldSaveCb || (() => true)
    this.errors = []
    this.maxFailures = maxFailures
    this.cancelAllRequests = false
    this.persist = throttle(() => {
      this.save()
    }, throttleRate, {leading: false})
    this.store.on('change', this.onChange, this)
    this.setInitialState()
  }

  /**
   * Should be called before removing this object so that the event handler is removed from the datastore
   */
  destroy () {
    this.store.off('change', this.onChange)
    this.persist.cancel()
    this.cancelAllRequests = true
  }

  /**
   * Store the intitial state using the stateExtractor callback
   */
  setInitialState () {
    this.lastPersistedState = cloneDeep(this.stateExtractor())
  }

  /**
   * Fires when some data has changed
   */
  onChange () {
    console.log('some data changed')
    this.persist()
  }

  /**
   * Actually persist the data.
   * @returns {Promise<any>} - A promise resolving to the results of the saveCallback
   */
  save () {
    if (this.cancelAllRequests) {
      this.hasNewData = false
      return
    }
    console.log('saving something')
    if (this.existingRequest) {
      this.hasNewData = true
      return this.existingRequest
    }
    if (this.errors.length > this.maxFailures) {
      console.log('exceeded max attempts at storing data', this.errors)
    }
    let state = this.stateExtractor()

    // NOTE: Is this even necessary? What is the use case for emitting a change event, but not wanting the changes to be
    // stored eventually. If that's the case, probably just don't use the persist slave at all
    if (!this.shouldSaveCb(state, this.lastPersistedState)) {
      this.hasNewData = false
      return
    }

    let existingRequestState = cloneDeep(state)
    this.existingRequest = this.saveCb(existingRequestState, this.lastPersistedState).then(() => {
      this.lastPersistedState = existingRequestState
      // Make another throttled request if new data was stored while the save was happening
      if (this.hasNewData) {
        this.persist()
      }
      // Clean up any errors
      this.errors = []
    }).catch(e => {
      this.errors.push({
        time: Date.now(),
        error: e
      })
      this.persist()
    }).then(() => {
      this.existingRequest = null
    })

    return this.existingRequest
  }
}

/**
 * This function is called when we want to write to disc
 * @callback PersistSlave~saveCallback
 * @param {any} currentState - The current state of the data
 * @param {any} previousState - The state of the data the last time we persisted
 * @returns {Promise<any>} - Should resolve if the save was completed successfully. Should reject if it doesn't
 */

/**
 * This function is called when we're deciding whether or not to write to disk
 * @callback PersistSlave~shouldSaveCallback
 * @param {any} currentState - The current state of the data
 * @param {any} previousState - The state of the data the last time we persisted
 * @returns {Boolean} - True means we should save
 */

/**
 * This function is called when we want to know the current state of the data store
 * @callback PersistSlave~stateExtractorCb
 * @returns {any} - The current state of the data we want to store
 */

