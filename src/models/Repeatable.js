export default class Repeatable {
  constructor (blueprint) {
    this.blueprint = blueprint
    this.repetitions = []
  }
  _generateFromBlueprint (blueprint) {
    console.error('Must define a generator function for the repeatable abstract class')
  }
  get (repetitionIndex) {
    return this.repetitions[repetitionIndex]
  }
}
