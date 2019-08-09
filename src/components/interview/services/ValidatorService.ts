import { ValidationRules } from '../../../classes/Validators'
import v18n from '../../../i18n/index'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Question from '../../../entities/trellis/Question'
import QuestionParameter from '../../../entities/trellis/QuestionParameter'
import ParameterType from '../../../static/parameter.types'
import QT from '../../../static/question.types'
import PT from '../../../static/parameter.types'

// All of the validation errors that will be displayed when validation fails
export const validationErrors = {
  min: min => v18n.t('value_must_be_greater_than_min', [min]),
  max: max => v18n.t('value_must_be_less_than_max', [max]),
  is_required: () => v18n.t('response_required'),
  read_only: () => `How did you get here? This question is read only.`,
  min_geos: min => v18n.t('value_must_be_greater_than_min', [min]),
  max_geos: max => v18n.t('value_must_be_less_than_max', [max]),
  min_roster: min => v18n.t('value_must_be_greater_than_min', [min]),
  max_roster: max => v18n.t('value_must_be_less_than_max', [max]),
  min_relationships: min => v18n.t('value_must_be_greater_than_min', [min]),
  max_relationships: max => v18n.t('value_must_be_less_than_max', [max])
}

export const typeHandlers = {
  'read_only': function () {
    return true
  },
  'min': function (qd: QuestionDatum, pVal: any) {
    pVal = parseInt(pVal, 10)
    return qd.data.length && qd.data[0].val >= pVal
  },
  'max': function (qd: QuestionDatum, pVal: any) {
    pVal = parseInt(pVal, 10)
    return qd.data.length && qd.data[0].val <= pVal
  },
  'min_geos': function (qd: QuestionDatum, pVal: any) {
    pVal = parseInt(pVal, 10)
    return qd.data.length >= pVal
  },
  'max_geos': function (qd: QuestionDatum, pVal: any) {
    pVal = parseInt(pVal, 10)
    return qd.data.length <= pVal
  },
  'is_required': function (qd: QuestionDatum, pVal: any, pMap) {
    if (pVal) {
      const isSingleDatumType = qd.data && qd.data.length && ['text', 'integer', 'decimal'].indexOf(qd.data[0].name) > -1
      if (qd.data && qd.data.length && (!isSingleDatumType || ('' + qd.data[0].val).length > 0)) {
        return true
      } else if (pMap[PT.show_dk] || pMap[PT.show_rf]) {
        return qd.dkRf !== undefined && qd.dkRf !== null && qd.dkRfVal && qd.dkRfVal.length
      } else {
        return false
      }
    } else {
      return true
    }
  }
}

// Aliases
typeHandlers['min_relationships'] = typeHandlers['min_geos']
typeHandlers['max_relationships'] = typeHandlers['max_geos']
typeHandlers['min_roster'] = typeHandlers['min_geos']
typeHandlers['max_roster'] = typeHandlers['max_geos']

function makeValueValidator (validator: Function): Function {
  return function (qd: QuestionDatum, pVal: number) {
    pVal = +pVal // Cast as number
    const val = qd.data && qd.data.length && qd.data[0].val
    return validator(val, pVal)
  }
}

function makeLengthValidator (validator: Function, invalidResponse?: Function): Function {
  return function (qd: QuestionDatum, pVal: number) {
    pVal = +pVal
    console.log('calling length validator with', pVal, qd.data.length)
    return qd.data && validator(qd.data, pVal)
  }
}

export const parameterValidationRules = {
  read_only () {
    return true
  },
  min: makeValueValidator(ValidationRules.min),
  max: makeValueValidator(ValidationRules.max),
  max_geos: makeLengthValidator(ValidationRules.maxLength),
  min_geos: makeLengthValidator(ValidationRules.minLength),
  is_required (qd: QuestionDatum, pVal: any, pMap) {
    if (pVal) {
      const isSingleDatumType = qd.data && qd.data.length && ['text', 'integer', 'decimal'].indexOf(qd.data[0].name) > -1
      if (qd.data && qd.data.length && (!isSingleDatumType || ('' + qd.data[0].val).length > 0)) {
        return true
      } else if (pMap[PT.show_dk] || pMap[PT.show_rf]) {
        return qd.dkRf !== undefined && qd.dkRf !== null && qd.dkRfVal && qd.dkRfVal.length
      } else {
        return false
      }
    } else {
      return true
    }
  }
}

parameterValidationRules['min_relationships'] = parameterValidationRules['min_geos']
parameterValidationRules['max_relationships'] = parameterValidationRules['max_geos']
parameterValidationRules['min_roster'] = parameterValidationRules['min_geos']
parameterValidationRules['max_roster'] = parameterValidationRules['max_geos']


// The parameter types that are actually checked here
const relevantTypes = [
  PT.min,
  PT.min_relationships,
  PT.max_relationships,
  PT.min_geos,
  PT.max_geos,
  PT.min_roster,
  PT.max_roster,
  PT.max,
  PT.is_required
]

/**
 * Convert the parameter to the correct data type
 * @param {String} questionType
 * @param {String} parameterType
 * @param {any} value
 * @returns {*}
 */
function castParameter (questionType: string, parameterType: string | number, value: any) {
  const type = +parameterType
  switch (type) {
    case PT.min:
    case PT.max:
      return questionType === QT.integer ? parseInt(value, 10) : parseFloat(value)
    case PT.min_relationships:
    case PT.max_relationships:
    case PT.min_roster:
    case PT.max_roster:
    case PT.min_geos:
    case PT.max_geos:
      return parseInt(value, 10)
    case PT.is_required:
      return typeof value === 'string' ? value === 'true' : value
    default:
      return value
  }
}

// @ts-ignore
export function parametersToMap (parameters: QuestionParameter[], question: Question): {[key: ParameterType]: boolean} {
  let pMap = parameters.reduce((map, p) => {
    map[p.parameterId] = castParameter(question.questionTypeId, p.parameterId, p.val)
    return map
  }, {
    [PT.read_only]: question.questionTypeId === QT.intro,
    [PT.is_required]: true,
    [PT.show_dk]: true,
    [PT.show_rf]: true
  })

  if (typeof pMap[PT.is_required] === 'string') {
    // @ts-ignore
    pMap[PT.is_required] = pMap[PT.is_required] === 'true'
  }

  return pMap
}

function validateIndependentParameters (questionDatum: QuestionDatum, pMap: {[key: string]: any}) {
  // Handle the trivial case
  if (pMap[PT.read_only]) {
    return true
  }

  if (questionDatum && questionDatum.noOne) {
    return true
  }

  if (pMap[PT.is_required] && (pMap[PT.show_dk] || pMap[PT.show_rf])) {
    if (questionDatum && questionDatum.dkRf !== null && questionDatum.dkRf !== undefined && questionDatum.dkRfVal && questionDatum.dkRfVal.length) {
      return true
    }
  }

  return false
}

/**
 * Validate that a question satisfies all parameters
 * @param {Object} question
 * @param {Array} parameters
 * @param {Object} questionDatum
 * @returns {boolean}
 */
export function validateParametersNew (question: Question, parameters: QuestionParameter[], questionDatum: QuestionDatum) {
  let pMap = parametersToMap(parameters, question)

  if (validateIndependentParameters(questionDatum, pMap)) return true

  for (let type of relevantTypes) {
    if (pMap[type] !== undefined && pMap[type] !== null) {
      const parameterName = PT[type]
      if (!parameterValidationRules[parameterName](questionDatum, pMap[type], pMap)) {
        return validationErrors[parameterName](pMap[type])
      }
    }
  }

  return true
}

/**
 * Validate all of the parameters and return either true, or a string with the error message
 * @param {Object} question
 * @param {Array} parameters
 * @param {Object} questionDatum
 * @returns {boolean|string}
 */
export function allParametersAreValidWithError (question: Question, parameters: QuestionParameter[], questionDatum: QuestionDatum) {
  return validateParametersNew(question, parameters, questionDatum)
}

/**
 * Returns an array of validation rules for use with Vuetify rules prop
 * @param {Object} question
 * @param {Array<Object>} parameters
 * @returns {Array}
 */
export function makeValidationRules (question: Question, parameters: QuestionParameter[]) {
  let rules = []
  for (let parameter of parameters) {
    let parameterValue = castParameter(question.questionTypeId, parameter.parameterId, parameter.val)
    if (validationErrors[parameter.parameter.name]) {
      const errorMessage = validationErrors[parameter.parameter.name](parameterValue)
      rules.push(function () {
        return parameterValidationRules[parameter.parameter.name](question.datum, parameterValue) || errorMessage
      })
    }
  }
  return rules
}

export default validateParametersNew
