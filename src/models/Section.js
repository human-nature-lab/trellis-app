import Page from './Page'
export default class Section {
  constructor (sectionBlueprint) {
    this.sectionId = sectionBlueprint.id
    this.pages = []
    for (let pageBlueprint of sectionBlueprint.pages) {
      this._addPage(pageBlueprint)
    }
  }
  _addPage (pageBlueprint) {
    let repeatedPage = {
      pageId: pageBlueprint,
      followUpQuestion: null,
      repetitions: []
    }
    this.pages.push(repeatedPage)
    let page = new Page(pageBlueprint)
    repeatedPage.repetitions.push(page)
    return page
  }
}
