import v18n from '../../../i18n/index'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Question from '../../../entities/trellis/Question'
import QuestionParameter from '../../../entities/trellis/QuestionParameter'
// All of the validation errors that will be displayed when validation fails
export const validationErrors = {
  min: min => v18n.t('value_must_be_greater_than_min', min),
  max: max => v18n.t('value_must_be_less_than_max', max),
  is_required: () => v18n.t('response_required'),
  read_only: () => `How did you get here? This question is read only.`,
  min_geos: min => v18n.t('value_must_be_greater_than_min', min),
  max_geos: max => v18n.t('value_must_be_less_than_max', max),
  min_roster: min => v18n.t('value_must_be_greater_than_min', min),
  max_roster: max => v18n.t('value_must_be_less_than_max', max),
  min_relationships: min => v18n.t('value_must_be_greater_than_min', min),
  max_relationships: max => v18n.t('value_must_be_less_than_max', max)
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
      if (qd.data && qd.data.length && (qd.data[0].val == null || ('' + qd.data[0].val).length > 0)) {

        return true
      } else if (pMap.show_dk || pMap.show_rf) {
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

// The parameter types that are actually checked here
const relevantTypes = [
  'min',
  'min_relationships',
  'max_relationships',
  'min_geos',
  'max_geos',
  'min_roster',
  'max_roster',
  'max',
  'is_required'
]

/**
 * Convert the parameter to the correct data type
 * @param {String} questionType
 * @param {String} parameterType
 * @param {any} value
 * @returns {*}
 */
function castParameter (questionType: string, parameterType: string, value: any) {
  switch (parameterType) {
    case 'min':
    case 'max':
      return questionType === 'integer' ? parseInt(value, 10) : parseFloat(value)
    case 'min_relationships':
    case 'max_relationships':
    case 'min_roster':
    case 'max_roster':
    case 'min_geos':
    case 'max_geos':
      return parseInt(value, 10)
    case 'is_required':
      return typeof value === 'string' ? value === 'true' : value
    default:
      return value
  }
}

export function parametersToMap (parameters: QuestionParameter[], question: Question) {
  let pMap = parameters.reduce((map, p) => {
    map[p.parameter.name] = castParameter(question.questionType.name, p.parameter.name, p.val)
    return map
  }, {
    read_only: question.questionType.name === 'intro',
    is_required: true,
    show_dk: true,
    show_rf: true
  })

  if (typeof pMap.is_required === 'string') {
    pMap.is_required = pMap.is_required === 'true'
  }

  return pMap
}

/**
 * Validate the parameters supplied with the question
 * @param {Object} question
 * @param {Array} parameters
 * @param {Object} questionDatum
 * @returns {boolean}
 */
export function validateParameters (question: Question, parameters: QuestionParameter[], questionDatum: QuestionDatum) {
  return allParametersAreValidWithError(question, parameters, questionDatum) === true
}

/**
 * Validate all of the parameters and return either true, or a string with the error message
 * @param {Object} question
 * @param {Array} parameters
 * @param {Object} questionDatum
 * @returns {boolean|string}
 */
export function allParametersAreValidWithError (question: Question, parameters: QuestionParameter[], questionDatum: QuestionDatum) {
  let pMap = parametersToMap(parameters, question)

  // Handle the trivial case
  if (pMap.read_only) {
    return true
  }

  if (questionDatum.noOne) {
    return true
  }

  if (pMap.is_required && (pMap.show_dk || pMap.show_rf)) {
    if (questionDatum.dkRf !== null && questionDatum.dkRf !== undefined && questionDatum.dkRfVal && questionDatum.dkRfVal.length) {
      return true
    }
  }

  for (let type of relevantTypes) {
    if (pMap[type] !== undefined && pMap[type] !== null) {
      const validatorResult = typeHandlers[type](questionDatum, pMap[type], pMap)
      if (!validatorResult) {
        return validationErrors[type](pMap[type])
      }
    }
  }

  return true
}

/**
 * Returns an array of validation rules for use with Vuetify rules prop
 * @param {Object} question
 * @param {Array<Object>} parameters
 * @returns {Array}
 */
export function makeValidationRules (question, parameters) {
  let rules = []
  for (let parameter of parameters) {
    let parameterValue = castParameter(question.type.name, parameter.parameter.name, parameter.val)
    let errorMessage = validationErrors[parameter.parameter.name](parameterValue)
    if (validationErrors[parameter.parameter.name]) {
      rules.push(function (value) {
        return typeHandlers[parameter.parameter.name](question.datum, parameterValue) ? true : errorMessage
      })
    }
  }
  return rules
}

export default validateParameters
