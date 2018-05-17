/**
 * Drop in chainable guards for vue-router. Executes any number of guards in order with the next guard being executed
 * when and only if the previous one completed successfully
 * @param {...Function} guards
 * @returns {guardChain}
 */
export default function chainableGuards (...guards) {
  let to, from, next
  function callNextGuardOrFinish (to, from) {
    let guard = guards.shift()
    if (!guard) {
      return next()
    } else {
      return guard(to, from, function (...args) {
        // Bail early if any arguments are present
        if (args.length) {
          return next(...args)
        } else {
          return callNextGuardOrFinish(to, from)
        }
      })
    }
  }

  return function guardChain (...args) {
    [to, from, next] = args
    return callNextGuardOrFinish(to, from)
  }
}
