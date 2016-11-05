/*

  AUTHOR:  John Lauer
  -- S??? (laser intensity) Parameter Handling added by AUTHOR: Peter van der Walt
  v19/6/2016

*/

// This is a simplified and updated version of http://gcode.joewalnes.com/ that works with the latest version of Three.js (v68).
// Updated with code from http://chilipeppr.com/tinyg's 3D viewer to support more CNC type Gcode
var totaltimemax = ''
totaltimemax = 0

var lineObjects = new THREE.Object3D()
lineObjects.name = 'LineObjects'

function GCodeParser (handlers) {
  handlers = handlers || {}

  lastArgs = {cmd: null}
  lastFeedrate = null
  isUnitsMm = true
}
colorG0: 0x00ff00
colorG1: 0x0000ff
colorG2: 0x999900




  var bufSize = 10000; // Arbitrary - play around with!
  var lineObject = {active: false,
    vertexBuf: new Float32Array(6 * bufSize), // Start with bufSize line segments
    colorBuf: new Float32Array(6 * bufSize), // Start with bufSize line segments
    nLines: 0,
  }
  var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors,
    opacity: 0.8,
    transparent: true,
    linewidth: 1,
  })




  totalDist = 0
  totalTime = 0

  var relative = false
  var tool = null




  var cofg = this

  //parser = new GCodeParser(

function drawobject () {
  var newObject = false
  // console.log("INSIDE DRAWOBJECT")
  // set what units we're using in the gcode
  isUnitsMm = parser.isUnitsMm

  newObject = new THREE.Object3D()
  newObject.name = 'newObject'

  // old approach of monolithic line segment
  for (var lid in layers3d) {
    // console.log('processing Layer ' + lid)
    var layer = layers3d[lid]
    for (var tid in layer.type) {
      var type = layer.type[tid]
      var bufferGeo = convertLineGeometryToBufferGeometry(type.geometry, type.color)
      newObject.add(new THREE.Line(bufferGeo, type.material, THREE.LinePieces))
    }
  }
  newObject.add(new THREE.Object3D())
  // XY PLANE
  extraObjects['G17'].forEach(function (obj) {
    var bufferGeo = convertLineGeometryToBufferGeometry(obj.geometry, obj.material.color)
    newObject.add(new THREE.Line(bufferGeo, obj.material))
  }, this)
  // XZ PLANE
  extraObjects['G18'].forEach(function (obj) {
    // buffered approach
    var bufferGeo = convertLineGeometryToBufferGeometry(obj.geometry, obj.material.color)
    var tmp = new THREE.Line(bufferGeo, obj.material)
    tmp.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    newObject.add(tmp)
  }, this)
  // YZ PLANE
  extraObjects['G19'].forEach(function (obj) {
    // buffered approach
    var bufferGeo = convertLineGeometryToBufferGeometry(obj.geometry, obj.material.color)
    var tmp = new THREE.Line(bufferGeo, obj.material)
    tmp.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    tmp.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    newObject.add(tmp)
  }, this)

  // use new approach of building 3d object where each
  // gcode line is its own segment with its own userData
  // object = new3dObj

  // Center
  var scale = 1; // TODO: Auto size

  var center = new THREE.Vector3(
    bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
    bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
    bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2))

  var center2 = new THREE.Vector3(
    bbbox2.min.x + ((bbbox2.max.x - bbbox2.min.x) / 2),
    bbbox2.min.y + ((bbbox2.max.y - bbbox2.min.y) / 2),
    bbbox2.min.z + ((bbbox2.max.z - bbbox2.min.z) / 2))

  var dX = bbbox2.max.x - bbbox2.min.x
  var dY = bbbox2.max.y - bbbox2.min.y
  var dZ = bbbox2.max.z - bbbox2.min.z

  function toTimeString (seconds) {
    // return (new Date(seconds * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0]
  }

  console.log(totaltimemax + '  seconds estimated')

  // printLog('Estimated Job Time: '+totaltimemax, successcolor)

  printLog('Estimated Distance: <b>' + (totalDist / 1000).toFixed(1) + ' m</b>', msgcolor, 'viewer')
  $('#lasertimeqty').val((totalDist.toFixed(1)) / 10)

  if (fileParentGroup) {
    var bbox2 = new THREE.Box3().setFromObject(fileParentGroup)
    //  console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) )
    width = (bbox2.max.x - bbox2.min.x)
    height = (bbox2.max.y - bbox2.min.y)
    $('#quoteresult').html('Job moves length: ' + totalDist.toFixed(1) + ' mm<br> Width: ' + width.toFixed(1) + ' mm<br>Height: ' + height.toFixed(1) + ' mm<br>Material: ' + ((width * height) / 1000).toFixed(3) + 'cm<sup>2</sup>')
    $('#materialqty').val(((width * height) / 1000).toFixed(3))
  } else if (rastermesh) {
    var bbox2 = new THREE.Box3().setFromObject(rastermesh)
    //  console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) )
    width = (bbox2.max.x - bbox2.min.x)
    height = (bbox2.max.y - bbox2.min.y)
    $('#quoteresult').html('Job moves length: ' + totalDist.toFixed(1) + ' mm<br> Width: ' + width.toFixed(1) + ' mm<br>Height: ' + height.toFixed(1) + ' mm<br>Material: ' + ((width * height) / 1000).toFixed(3) + 'cm<sup>2</sup>')
    $('#materialqty').val(((width * height) / 1000).toFixed(3))
  }

  console.groupEnd()
  return newObject
  // console.groupEnd()

}
