export default class Page {
  constructor () {
    this.questions = []
  }
  load (questions) {
    for (let question of questions) {
      this.questions.push(question)
    }
  }
  clear () {
    // Clear without removing any references to this.questions
    this.questions.splice(0, this.questions.length)
  }
  setAnswered (id, val) {
    this.questions.find(q => q.id === id).isAnswered = val
  }
}
