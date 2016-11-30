export function drawArc (state, aX, aY, aZ, endaZ, aRadius, aStartAngle, aEndAngle, aClockwise, plane) {
  // console.log("drawArc:", aX, aY, aZ, aRadius, aStartAngle, aEndAngle, aClockwise)
  let ac = new THREE.ArcCurve(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) // FIXME a harder one ...
  // console.log("ac:", ac)
  const material = {
    color: 0x00aaff,
    opacity: 0.5
  }
  let geometry = {
    positions: []
  }
  let ctr = 0
  let z = aZ
  ac.getPoints(20).forEach(function (v) {
    // console.log(v)
    z = (((endaZ - aZ) / 20) * ctr) + aZ
    geometry.positions.push(v.x, v.y, z)
    ctr++
  })
  const aco = {geometry, material}
  // aco.position.set(pArc.x, pArc.y, pArc.z)
  // console.log("aco:", aco)
  state.extraObjects[plane].push(aco)
  return aco
}

export function drawArcFrom2PtsAndCenter (vp1, vp2, vpArc, args) {
  // console.log("drawArcFrom2PtsAndCenter. vp1:", vp1, "vp2:", vp2, "vpArc:", vpArc, "args:", args)

  // var radius = vp1.distanceTo(vpArc)
  // console.log("radius:", radius)

  // Find angle
  const p1deltaX = vpArc.x - vp1.x
  const p1deltaY = vpArc.y - vp1.y
  const p1deltaZ = vpArc.z - vp1.z

  const p2deltaX = vpArc.x - vp2.x
  const p2deltaY = vpArc.y - vp2.y
  const p2deltaZ = vpArc.z - vp2.z

  let anglepArcp1
  let anglepArcp2
  switch (args.plane) {
    case 'G18':
      anglepArcp1 = Math.atan(p1deltaZ / p1deltaX)
      anglepArcp2 = Math.atan(p2deltaZ / p2deltaX)
      break
    case 'G19':
      anglepArcp1 = Math.atan(p1deltaZ / p1deltaY)
      anglepArcp2 = Math.atan(p2deltaZ / p2deltaY)
      break
    default:
      anglepArcp1 = Math.atan(p1deltaY / p1deltaX)
      anglepArcp2 = Math.atan(p2deltaY / p2deltaX)
  }

  // Draw arc from arc center
  const radius = vpArc.distanceTo(vp1)
  const radius2 = vpArc.distanceTo(vp2)
  // console.log("radius:", radius)

  if (Number((radius).toFixed(2)) != Number((radius2).toFixed(2))) {
    console.log('Radiuses not equal. r1:', radius, ', r2:', radius2, ' with args:', args, ' rounded vals r1:', Number((radius).toFixed(2)), ', r2:', Number((radius2).toFixed(2)))
  }

  // arccurve
  var clwise = args.clockwise
  //if (args.clockwise === false) clwise = false

  switch (args.plane) {
    case 'G19':
      if (p1deltaY >= 0) anglepArcp1 += Math.PI
      if (p2deltaY >= 0) anglepArcp2 += Math.PI
      break
    default:
      if (p1deltaX >= 0) anglepArcp1 += Math.PI
      if (p2deltaX >= 0) anglepArcp2 += Math.PI
  }

  if (anglepArcp1 === anglepArcp2 && clwise === false)
  {
    let obj = undefined
    // Draw full circle if angles are both zero,
    // start & end points are same point... I think
    switch (args.plane) {
      case 'G18':
        obj = drawArc(vpArc.x, vpArc.z, (-1 * vp1.y), (-1 * vp2.y), radius, anglepArcp1, (anglepArcp2 + (2 * Math.PI)), clwise, 'G18')
        break
      case 'G19':
        obj = drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, (anglepArcp2 + (2 * Math.PI)), clwise, 'G19')
        break
      default:
        obj = drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, (anglepArcp2 + (2 * Math.PI)), clwise, 'G17')
    }
  }
  else
    switch (args.plane) {
      case 'G18':
        obj = drawArc(vpArc.x, vpArc.z, (-1 * vp1.y), (-1 * vp2.y), radius, anglepArcp1, anglepArcp2, clwise, 'G18')
        break
      case 'G19':
        obj = drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, anglepArcp2, clwise, 'G19')
        break
      default:
        obj = drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, anglepArcp2, clwise, 'G17')
  }
}
