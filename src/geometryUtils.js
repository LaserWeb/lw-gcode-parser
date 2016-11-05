
function convertLineGeometryToBufferGeometry (lineGeometry, color) {
  var positions = new Float32Array(lineGeometry.vertices.length * 3)
  var colors = new Float32Array(lineGeometry.vertices.length * 3)

  var geometry = new THREE.BufferGeometry()

  for (var i = 0; i < lineGeometry.vertices.length; i++) {
    var x = lineGeometry.vertices[i].x
    var y = lineGeometry.vertices[i].y
    var z = lineGeometry.vertices[i].z

    // positions
    positions[ i * 3 ] = x
    positions[ i * 3 + 1 ] = y
    positions[ i * 3 + 2 ] = z

    // colors
    colors[ i * 3 ] = color.r
    colors[ i * 3 + 1 ] = color.g
    colors[ i * 3 + 2 ] = color.b
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))

  geometry.computeBoundingSphere()

  return geometry
}
