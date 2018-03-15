import InterviewNavigator from './InterviewNavigator'
// import dataService from './DataService'
export default class InterviewState {
  constructor (data = []) {
    this.interviewNavigator = InterviewNavigator
    this.data = []
  }
  doAction (action) {
    switch (action.name) {
      case 'next':
        this.interviewNavigator.next()
        break
      case 'previous':
        this.interviewNavigator.previous()
        break
      default:
        console.log(action)
    }
  }
  /**
   * TODO: Return the differences between this state and another state
   * @param otherState
   * @returns {Array}
   */
  diff (otherState) {
    // Just return if it's the same state
    if (this === otherState) return []
    return []
  }

  /**
   * Return a copy of the state with all references removed
   * @returns {InterviewState}
   */
  copy () {
    return new InterviewState(JSON.parse(JSON.stringify(this.data)))
  }
}

let state = null
export function sharedState (data) {
  if (!state) {
    state = new InterviewState(data)
  }
  return state
}
