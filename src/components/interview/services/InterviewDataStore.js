// Mock data structure
class InterviewDataService {
  constructor (sections = {}) {
    this.respondentConditionTags = {}
    this.formConditionTags = {}
    this.sections = sections
  }

  hasConditionTag (conditionTagId, sectionId, followUpRepetitionId = 0, repetitionId = 0) {
    return this.respondentConditionTags[conditionTagId] ||
      this.formConditionTags[conditionTagId] ||
      this.getSection(sectionId, followUpRepetitionId, repetitionId).sectionConditionTags[conditionTagId]
  }

  makeSection (sectionId, followUpRepetitionId = 0, repetitionId = 0) {
    if (!this.sections[sectionId]) {
      this.sections[sectionId] = {
        repetitions: []
      }
    }
    if (!this.sections[sectionId].repetitions[repetitionId]) {
      this.sections[sectionId].repetitions[repetitionId] = {
        followUpRepetitions: {}
      }
    }
    if (!this.sections[sectionId].repetitions[repetitionId].followUpRepetitions[followUpRepetitionId]) {
      this.sections[sectionId].repetitions[repetitionId].followUpRepetitions[followUpRepetitionId] = {
        sectionConditionTags: {},
        pages: {}
      }
    }
  }

  makePage (sectionId, pageId, followUpRepetitionId = 0, repetitionId = 0) {
    this.makeSection(sectionId, followUpRepetitionId, repetitionId)
    let section = this.getSection(sectionId, followUpRepetitionId, repetitionId)
    if (!section.pages[pageId]) {
      section.pages[pageId] = {
        questions: {}
      }
    }
  }

  getSection (sectionId, followUpRepetitionId = 0, repetitionId = 0) {
    try {
      return this.sections[sectionId].repetitions[repetitionId].followUpRepetitions[followUpRepetitionId]
    } catch (err) {
      console.error(`Unable to access this section. (section: ${sectionId}, followUpRepetition: ${followUpRepetitionId}, repetition: ${repetitionId}) It probably hasn't been created yet`)
      // This feels like a terribly dangerous pattern...
      this.makeSection(sectionId, followUpRepetitionId, repetitionId)
      return this.getSection(sectionId, followUpRepetitionId, repetitionId)
    }
  }

  getPageQuestionData (sectionId, pageId, followUpRepetitionId = 0, repetitionId = 0) {
    try {
      return this.getSection(sectionId, followUpRepetitionId, repetitionId).pages[pageId].questions
    } catch (err) {
      console.error(`Unable to access this page. (page: ${pageId}) It probably hasn't been created yet`)
      this.makePage(sectionId, pageId, followUpRepetitionId, repetitionId)
      return this.getPageQuestionData(sectionId, pageId, followUpRepetitionId, repetitionId)
    }
  }

  setQuestionData (data, questionId, ...getPageQuestionArgs) {
    try {
      this.getPageQuestionData(...getPageQuestionArgs)[questionId].data = data
    } catch (err) {
      console.error(`Unable to access this question (question: ${questionId}). It probably hasn't been created yet`)
      return null
    }
  }

  getSectionConditionTags (...getSectionArgs) {
    return this.getSection(...getSectionArgs).sectionConditionTags.concat(this.respondentConditionTags).concat(this.formConditionTags)
  }

  copy () {
    return new InterviewDataService(JSON.parse(JSON.stringify(this.sections)))
  }

}

export default new InterviewDataService()
