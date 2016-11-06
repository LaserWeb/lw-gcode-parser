export default function parser (gcode, progressCallback, doneCallback) {
  lineObjects
  laserxmax
  laserymax

  console.log('inside this.parse')
  object = null
  var lines = gcode.split(/\r{0,1}\n/)
  var count = lines.length
  var maxTimePerChunk = 500
  var index = 0

  function now () {
    return new Date().getTime()
  }


  function doChunk () {
    var progress = (index / count)
    progressCallback(progress)
    var startTime = now()
    while (index < count && (now() - startTime) <= maxTimePerChunk) {
      // console.log('parsing ' + lines[index])
      parseLine(lines[index], index)
      ++index
    }
    closeLineSegment()
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
  doChunk()
}
