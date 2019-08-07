import { AxiosError } from 'axios'

export function allMatches (str: string, exp: RegExp) {
  const res = []
  let m
  while ((m = exp.exec(str)) !== null) {
    res.push(m)
    if (m.index === exp.lastIndex) {
      exp.lastIndex++
    }
  }
  return res
}

/**
 * Creates a valid http path with all components of the path properly encoded. There are two ways to use this function.
 *
 *  Named map:
 *    uriTemplate('study/{studyId}/form/{formId}', {formId: 314, studyId: 1})
 *    > study/1/form/314
 *
 *  Positional array:
 *    uriTemplate('study/{study}/form/{}', [1, 314])
 *    > study/1/form/314
 * @param args
 */
export function uriTemplate (template: string, argsArrayOrMap: string[]|object): string {
  if (Array.isArray(argsArrayOrMap)) {
    const reg = /\{\w*\}/
    for (const arg of argsArrayOrMap) {
      template = template.replace(reg, encodeURIComponent(arg))
    }
  } else {
    for (let key in argsArrayOrMap) {
      template = template.replace(`{${key}}`, encodeURIComponent(argsArrayOrMap[key]))
    }
  }
  return template
}
