export default class InterviewState {
  constructor (questionData = []) {
    this.questionData = questionData
  }

  /**
   * Get the data that has already been assigned for this specific question
   * @param id
   * @param repetition
   * @returns {T | Array}
   */
  getQuestionData (id, repetition = null) {
    let questionData = this.questionData.find(qd => qd.id === id && qd.repetition === repetition)
    return questionData || []
  }

  /**
   * Create or update data for a question with the same id and repetition
   * @param {object} newQuestionDatum - Should have an id and repetition property
   * @param {array} data - An array of valid data to store
   * @returns {InterviewState}
   */
  setQuestionData (newQuestionDatum, data) {
    // Check for existing questionDatum with the same unique id and repetition combination
    let questionDatum = this.questionData.find(qd => qd.id === newQuestionDatum.id && qd.repetition === newQuestionDatum.repetition)
    if (!questionDatum) {
      questionDatum = newQuestionDatum
      this.questionData.push(questionDatum) // Add to questionData array and modify the reference from this point on
    }
    questionDatum.data = Object.assign([], data)
    console.log('Setting data')
    return this
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
   * @returns {InterviewManager}
   */
  copy () {
    return new InterviewState(JSON.parse(JSON.stringify(this.questionData)))
  }
}

let sState = null

// Return a shared reference to the same state
export function sharedState () {
  if (!sState) {
    sState = new InterviewState()
  }
  return sState
}
