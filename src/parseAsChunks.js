import parseLine from './parseLine'

function now () {
  return new Date().getTime()
}

export default function parseAsChunks (state, handlers, gcode) {
  const {lineObjects, laserxmax, laserymax} = state

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
    // closeLineSegment() //FIXME : add this back .??? or not

    // console.log('done parsing ')
    if (index < count) {
      setTimeout(doChunk, 1) // set Timeout for async iteration
    // console.log('[GCODE PARSE] ' + (index / count ) * 100 + "%")
    } else {
      console.log('done parsing')//, state.lineObjects.lines)
    }
  }

  doChunk()
}

// "old" for reference
export function __parser (gcode, params, progressCallback, doneCallback) {
  console.log('inside this.parse')
  object = null
  function doChunk () {
    const progress = (index / count)
    progressCallback(progress)

    let startTime = now()
    while (index < count && (now() - startTime) <= maxTimePerChunk) {
      // console.log('parsing ' + lines[index])
      parseLine(lines[index], index)
      ++index
    }
    // closeLineSegment() //FIXME : add this back !!

    // console.log('done parsing ')
    if (index < count) {
      setTimeout(doChunk, 1) // set Timeout for async iteration
    // console.log('[GCODE PARSE] ' + (index / count ) * 100 + "%")
    } else {
      doneCallback()
      object = drawobject()
      object.add(lineObjects)
      // console.log('Line Objects', lineObjects)
      object.translateX(laserxmax / 2 * -1)
      object.translateY(laserymax / 2 * -1)
      object.name = 'object'
      console.log('adding to scene')
      scene.add(object)
    }
  }

  // start it
  doChunk()
}