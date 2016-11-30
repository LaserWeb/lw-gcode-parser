import parseLine from './parseLine'

function now () {
  return new Date().getTime()
}

export default function parseAsChunks (state, handlers, gcode, doneCallback) {
  const lines = gcode.split(/\r{0,1}\n/)
  const count = lines.length
  const maxTimePerChunk = 500
  let index = 0

  function doChunk () {
    const progress = (index / count)

    let startTime = now()
    while (index < count && (now() - startTime) <= maxTimePerChunk) {
      // console.log('parsing ' + lines[index])
      parseLine(state, handlers, lines[index], index)
      ++index
    }
    // console.log('done parsing ')
    if (index < count) {
      setTimeout(doChunk, 1) // set Timeout for async iteration
    // console.log('[GCODE PARSE] ' + (index / count ) * 100 + "%")
    } else {
      // console.log('done parsing')//, state.lineObjects.lines)
      // cleanup , resize data typedArray to match actual data size
      state.linesData = state.linesData.subarray(0, state.linesDataOffset)
      doneCallback(state)

      //TODO: deal with this ?
      //object.translateX(laserxmax / 2 * -1)
      //object.translateY(laserymax / 2 * -1)
    }
  }
  doChunk()
}
