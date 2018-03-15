export default class Form {
  constructor (form = {}) {
    this.id = form.id
    this.sections = []
    for (let section of form) {
      let nSection = new Section
      this.sections.push()
    }
  }

  /**
   * Take a JSON type object and convert it into JavaScript objects
   * @param {object} structure - Structure of a form
   */
  loadStructure (structure) {

  }
}
