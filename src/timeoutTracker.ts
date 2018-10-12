const timers: Set<number> = new Set()
const oldTimeout = window.setTimeout
const oldInterval = window.setInterval
const oldClearTimeout = window.clearTimeout
const oldClearInterval = window.clearInterval

// @ts-ignore
window.setTimeout = function (cb: Function, timeout: number, ...args) {
  const id = oldTimeout(function (...nArgs) {
    timers.delete(id)
    console.log('removing timeout', id, timers.size)
    cb(...nArgs)
  }, timeout, ...args)
  timers.add(id)
  console.log('adding timeout', id, timers.size)
}

// @ts-ignore
window.setInterval = function (cb: function, interval: number, ...args) {
  const id = oldInterval(function (...nArgs) {
    timers.delete(id)
    console.log('removing interval', id, timers.size)
    cb(...nArgs)
  }, interval, ...args)
  timers.add(id)
  console.log('adding interval', id, timers.size)
}

// @ts-ignore
window.clearTimeout = function (idOrCb, ...args) {
  timers.delete(idOrCb)
  oldClearTimeout(idOrCb, ...args)
  console.log('clearing timeout', idOrCb)
}

// @ts-ignore
window.clearInterval = function (idOrCb, ...args) {
  timers.delete(idOrCb)
  oldClearInterval(idOrCb, ...args)
  console.log('clearing interval', idOrCb)
}
