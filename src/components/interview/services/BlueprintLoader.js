/**
 * Handles all the sorting and stuff when we're loading the form blueprint. If necessary, this could be a different
 * method for mobile and web
 * @param {Object} blueprint - A form blueprint following the same structure as the JSON returned from Laravel
 * @returns {Object}
 */
export default function blueprintLoader (blueprint) {
  blueprint = JSON.parse(JSON.stringify(blueprint))
  // Sort all levels
  blueprint.sections.sort((sectionA, sectionB) => {
    return sectionA.form_sections[0].sort_order - sectionB.form_sections[0].sort_order
  })
  for (let s = 0; s < blueprint.sections.length; s++) {
    let section = blueprint.sections[s]
    section.maxRepetitions = section.form_sections[0].max_repetitions
    section.isRepeatable = parseInt(section.form_sections[0].is_repeatable, 10) === 1
    section.followUpQuestionId = section.form_sections[0].follow_up_question_id
    section.question_groups.sort((pageA, pageB) => {
      return pageA.pivot.question_group_order - pageB.pivot.question_group_order
    })
    for (let page of section.question_groups) {
      page.questions.sort((questionA, questionB) => {
        return questionA.sort_order - questionB.sort_order
      })
      for (let question of page.questions) {
        this.varNameMap.set(question.var_name, question.id)
        this.questionMap.set(question.id, question)
        question.section = s
        if (question.choices) {
          question.choices.sort((cA, cB) => {
            return cA.pivot.sort_order - cB.pivot.sort_order
          })
        }
        assignParameters(question)
      }
    }
    section.pages = section.question_groups
  }
  return blueprint
}

function assignParameters (question) {
  question.parameters = {}
  for (let p of question.question_parameters) {
    switch (p.parameter.name) {
      case 'other':
      case 'other_exclusive':
        for (let choice of question.choices) {
          if (choice.val === p.val) {
            if (!choice.parameters) {
              choice.parameters = {}
            }
            choice.parameters[p.parameter.name] = p.val
          }
        }
        break
      default:
        question.parameters[p.parameter.name] = p.val
    }
  }
}
