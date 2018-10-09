/**
 * Drop in chainable guards for vue-router. Executes any number of guards in order with the next guard being executed
 * when and only if the previous one completed successfully
 * @param {...Function} guards
 * @returns {guardChain}
 */
import ImmutableQueue from '../../classes/ImmutableQueue'

export function parallel (...guards) {
  let next
  let nDone = 0
  function incrementAndFailOrFinish (...args) {
    nDone++
    if (args.length) {
      return next(...args)
    } else if (nDone === guards.length) {
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
  let to, from, next, queue
  function guardChain (...args) {
    [to, from, next] = args
    queue = new ImmutableQueue(guards)
    callNextGuardOrFinish()
  }

  function callNextGuardOrFinish () {
    let guard = queue.next()
    if (!guard) {
      next()
    } else {
      guard(to, from, function (arg) {
        // Bail early if any arguments are present
        if (arg !== undefined && arg !== null) {
          next(arg)
        } else {
          callNextGuardOrFinish()
        }
      })
    }
  }

  return guardChain
}
