export default function drawobject (state) {
  var newObject = false
  // console.log("INSIDE DRAWOBJECT")
  // set what units we're using in the gcode
  isUnitsMm = state.isUnitsMm

  newObject = {
    name: 'newObject'
  }

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

  const center = [
    bbox.min.x + ((bbox.max.x - bbox.min.x) / 2),
    bbox.min.y + ((bbox.max.y - bbox.min.y) / 2),
    bbox.min.z + ((bbox.max.z - bbox.min.z) / 2)]

  const center2 = [
    bbox2.min.x + ((bbox2.max.x - bbox2.min.x) / 2),
    bbox2.min.y + ((bbox2.max.y - bbox2.min.y) / 2),
    bbox2.min.z + ((bbox2.max.z - bbox2.min.z) / 2)]

  const dX = bbox2.max.x - bbox2.min.x
  const dY = bbox2.max.y - bbox2.min.y
  const dZ = bbox2.max.z - bbox2.min.z

  function toTimeString (seconds) {
    // return (new Date(seconds * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0]
  }

  //console.log(totaltimemax + '  seconds estimated')
  // printLog('Estimated Job Time: '+totaltimemax, successcolor)
  // printLog('Estimated Distance: <b>' + (totalDist / 1000).toFixed(1) + ' m</b>', msgcolor, 'viewer')

  const estimatedJobTime = totaltimemax
  const estimatedDistance = (totalDist / 1000).toFixed(1)
  const lasertimeqty = (totalDist.toFixed(1)) / 10

  if (fileParentGroup) {
    var bbox2 = new THREE.Box3().setFromObject(fileParentGroup)
    //  console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) )
  // <sup>2</sup>'
  } else if (rastermesh) {
    const bbox2 = new THREE.Box3().setFromObject(rastermesh)
    //  console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) )

  }
  const width = (bbox2.max.x - bbox2.min.x)
  const height = (bbox2.max.y - bbox2.min.y)
  const materialqty = ((width * height) / 1000).toFixed(3)
  const quoteresult = [
    `Job moves length: ${totalDist.toFixed(1)} mm`,
    `Width: ${width.toFixed(1)} mm`,
    `Height: ${height.toFixed(1)} mm`,
    `Material: ${((width * height) / 1000).toFixed(3)} cm`
  ]

  console.groupEnd()
  return newObject
}
