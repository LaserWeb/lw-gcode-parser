export default function parser (gcode) {
  console.log('inside this.parse')
  object = null
  var lines = gcode.split(/\r{0,1}\n/)
  var count = lines.length
  var maxTimePerChunk = 500
  var index = 0

  function now () {
    return new Date().getTime()
  }

  var tbody = ''

  function doChunk () {
    var progress = (index / count)
    NProgress.set(progress)
    var startTime = now()
    while (index < count && (now() - startTime) <= maxTimePerChunk) {
      // console.log('parsing ' + lines[index])
      parseLine(lines[index], index)
      // tbody += '<tr id="tr'+[index]+'"><td>'+[index]+'</td><td>'+lines[index]+'</td></tr>';//code here using lines[i] which will give you each line
      ++index
    }
    closeLineSegment()
    // console.log('done parsing ')
    if (index < count) {
      setTimeout(doChunk, 1) // set Timeout for async iteration
    // console.log('[GCODE PARSE] ' + (index / count ) * 100 + "%")
    } else {
      NProgress.done()
      NProgress.remove()
      // console.log('[GCODE PARSE] Done  ')
      $('#renderprogressholder').hide()
      object = drawobject()
      object.add(lineObjects)
      // console.log('Line Objects', lineObjects)
      object.translateX(laserxmax / 2 * -1)
      object.translateY(laserymax / 2 * -1)
      object.name = 'object'
      console.log('adding to scene')
      scene.add(object)
    // objectsInScene.push(object)
    }
  }
  doChunk()
}
