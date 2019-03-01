/**
 * Insert a buffer into another buffer in multiple positions at the same time.
 * @param buf - Buffer to perform replacement on
 * @param positions - An array of [start, end] arrays with the beginning and end of all sections to replace
 * @param replacementBuffer - Buffer to replace each position with
 * @returns {Buffer}
 */
function insertBuffer (buf, positions, replacementBuffer) {
  let lastIndex = 0
  const toConcat = []
  for (const pos of positions) {
    toConcat.push(buf.slice(lastIndex, pos[0]), replacementBuffer)
    lastIndex = pos[1]
  }
  toConcat.push(buf.slice(lastIndex))
  return Buffer.concat(toConcat)
}

function replaceBuffer (buf, pattern, replacement) {
  var start = buf.indexOf(pattern)
  if (start > -1) {
    var patBuf = Buffer.from(pattern)
    return insertBuffer(buf, [[start, start + patBuf.length]], Buffer.from(replacement))
  }
  return buf
}

function replaceAllBuffer (buf, pattern, replacement) {
  const positions = []
  const patternBuf = Buffer.from(pattern)
  let start = -1
  let lastEnd = 0
  do {
    start = buf.indexOf(pattern, lastEnd)
    if (start > -1) {
      lastEnd = start + patternBuf.length
      positions.push([start, lastEnd])
    }
  } while (start > -1)
  return insertBuffer(buf, positions, Buffer.from(replacement))
}


module.exports = {
  replaceAllBuffer: replaceAllBuffer,
  replaceBuffer: replaceBuffer,
  insertBuffer: insertBuffer
}

// console.log(replaceBuffer(Buffer.from('This is a {replace}'), '{replace}', 'dog').toString())
// console.log(replaceBuffer(Buffer.from('This is a {replace}'), 'replace', 'cat').toString())
// console.log(replaceBuffer(Buffer.from('This is a a a'), 'a', 'cat').toString())
// console.log(replaceBuffer(Buffer.from('aThis is a a a'), 'a', 'cat').toString())
// console.log(replaceAllBuffer(Buffer.from('This is a a a'), 'a', 'cat').toString())
// console.log(replaceAllBuffer(Buffer.from('aThisaaaaa is a a a'), 'a', 'cat').toString())
