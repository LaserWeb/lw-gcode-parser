export function getLineGroup (state, line, args) {
  console.log('getLineGroup:', line)
  if (state.layer === undefined) newLayer(line)
  const speed = Math.round(line.e / 1000)
  let opacity = line.s
  let tool = parseInt(line.t, 10)
  let grouptype = speed + opacity
  let color = null

  if (typeof line.s === 'undefined') {
    opacity = 0.3
  } else {
    opacity = line.s / state.lasermultiply
  }
  // LaserWeb 3D Viewer Colors
  if (typeof line.extruding === 'undefined' && typeof line.s === 'undefined') {
    // console.log('G1 without extrude', line)
    grouptype = 'g0'
    opacity = 0.3
    color = 0x00ff00
  } else {
    // console.log('G1 with extrude', line)
    if (line.g0) {
      grouptype = 'g0'
      opacity = 0.3
      color = 0x00ff00
    } else if (line.g2) {
      grouptype = 'g2'
      color = 0x990000
    } else if (line.t === 0) {
      grouptype = 't0'
      color = 0x0000ff
    } else if (line.t === 1) {
      grouptype = 't1'
      color = 0xff00ff
    } else if (line.arc) {
      grouptype = 'arc'
      color = 0x990000
    } else {
      color = 0x990000
    }
  }

  // see if we have reached indexMax, if so draw, but
  // make it ghosted
  // if (args.index > indexMax) {
  //    grouptype = "ghost"
  //    //console.log("args.index > indexMax", args, indexMax)
  //    color = 0x000000)
  // }
  // if (line.color) color = line.color)
  if (state.layer.type[grouptype] === undefined) {
    state.layer.type[grouptype] = {
      type: grouptype,
      feed: line.e,
      extruding: line.extruding,
      color: color,
      segmentCount: 0,
      //FIXME: how to deal with the things below ?
      /*material: new THREE.LineBasicMaterial({
        opacity: opacity,
        // opacity: line.extruding ? 0.5: line.g2 ? 0.2 : 0.3,
        transparent: true,
        linewidth: 1,
        vertexColors: THREE.FaceColors
      }),
      geometry: new THREE.Geometry(),*/
    }
  }
  return state.layer.type[grouptype]
}
