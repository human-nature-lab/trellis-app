import Question from './Question'
export default class Page {
  constructor (pageBlueprint) {
    this.id = pageBlueprint.id
    this.questions = []
    for (let questionBlueprint of pageBlueprint.questions) {
      this.questions.push(new Question(questionBlueprint))
    }
  }
}
