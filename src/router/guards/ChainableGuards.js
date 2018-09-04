/**
 * Drop in chainable guards for vue-router. Executes any number of guards in order with the next guard being executed
 * when and only if the previous one completed successfully
 * @param {...Function} guards
 * @returns {guardChain}
 */

export function parallel (...guards) {
  let next
  let nDone = 0
  function incrementAndFailOrFinish (...args) {
    nDone++
    if (args.length) {
      console.log('redirecting', args)
      return next(...args)
    } else if (nDone === guards.length) {
      console.log('finished with all guards')
      return next()
    }
  }
  return function parallelCB (to, from, n) {
    next = n
    guards.forEach(f => {
      f(to, from, incrementAndFailOrFinish)
    })
  }
}

export default function chainableGuards (...guards) {
  let to, from, next
  function callNextGuardOrFinish () {
    let guard = guards.shift()
    if (!guard) {
      console.log('finished with all guards')
      return next()
    } else {
      return guard(to, from, function (...args) {
        // Bail early if any arguments are present
        if (args.length) {
          console.log('redirecting', args)
          return next(...args)
        } else {
          console.log('moving to next guard')
          return callNextGuardOrFinish()
        }
      })
    }
  }

  return function guardChain (...args) {
    [to, from, next] = args
    callNextGuardOrFinish()
  }
}
