import { getLineGroup } from '../layers'
import {drawArcFrom2PtsAndCenter} from './arcs'

export function addSegment (state, args, p1, p2) {
  if(state.debug){
    console.log('addSegment')
  }
  closeLineSegment(state)
  let {bbox, bbox2} = state
  // console.log("")
  // console.log("addSegment p2:", p2)
  // add segment to array for later use
  let group = getLineGroup(p2, args)
  let geometry = group.geometry

  group.segmentCount++
  // see if we need to draw an arc
  if (p2.arc) {
    // console.log("")
    // console.log("drawing arc. p1:", p1, ", p2:", p2)

    // let segmentCount = 12
    // figure out the 3 pts we are dealing with
    // the start, the end, and the center of the arc circle
    // radius is dist from p1 x/y/z to pArc x/y/z
    // if(args.clockwise === false || args.cmd === "G3"){
    //    let vp2 = [p1.x, p1.y, p1.z]
    //    let vp1 = [p2.x, p2.y, p2.z]
    // }
    // else {
    const vp1 = [p1.x, p1.y, p1.z]
    const vp2 = [p2.x, p2.y, p2.z]
    // }
    let vpArc

    // if this is an R arc gcode command, we're given the radius, so we
    // don't have to calculate it. however we need to determine center
    // of arc
    if (args.r != null) {
      // console.log("looks like we have an arc with R specified. args:", args)
      // console.log("anglepArcp1:", anglepArcp1, "anglepArcp2:", anglepArcp2)
      const radius = parseFloat(args.r)
      // First, find the distance between points 1 and 2.  We'll call that q,
      // and it's given by sqrt((x2-x1)^2 + (y2-y1)^2).
      const q = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2))

      // Second, find the point halfway between your two points.  We'll call it
      // (x3, y3).  x3 = (x1+x2)/2  and  y3 = (y1+y2)/2.
      const x3 = (p1.x + p2.x) / 2
      const y3 = (p1.y + p2.y) / 2
      const z3 = (p1.z + p2.z) / 2

      // There will be two circle centers as a result of this, so
      // we will have to pick the correct one. In gcode we can get
      // a + or - val on the R to indicate which circle to pick
      // One answer will be:
      // x = x3 + sqrt(r^2-(q/2)^2)*(y1-y2)/q
      // y = y3 + sqrt(r^2-(q/2)^2)*(x2-x1)/q
      // The other will be:
      // x = x3 - sqrt(r^2-(q/2)^2)*(y1-y2)/q
      // y = y3 - sqrt(r^2-(q/2)^2)*(x2-x1)/q
      let pArc_1
      let pArc_2
      let calc = Math.sqrt((radius * radius) - Math.pow(q / 2, 2))
      let angle_point
      let cw
      let ccw

      switch (args.plane) {
        case 'G18':
          pArc_1 = {
            x: x3 + calc * (p1.z - p2.z) / q,
            y: y3 + calc * (p2.y - p1.y) / q,
          z: z3 + calc * (p2.x - p1.x) / q }
          pArc_2 = {
            x: x3 - calc * (p1.z - p2.z) / q,
            y: y3 - calc * (p2.y - p1.y) / q,
          z: z3 - calc * (p2.x - p1.x) / q }

          angle_point = Math.atan2(p1.z, p1.x) - Math.atan2(p2.z, p2.x)
          if (((p1.x - pArc_1.x) * (p1.z + pArc_1.z)) + ((pArc_1.x - p2.x) * (pArc_1.z + p2.z)) >=
            ((p1.x - pArc_2.x) * (p1.z + pArc_2.z)) + ((pArc_2.x - p2.x) * (pArc_2.z + p2.z))) {
            cw = pArc_1
            ccw = pArc_2
          } else {
            cw = pArc_2
            ccw = pArc_1
          }
          break
        case 'G19':
          pArc_1 = {
            x: x3 + calc * (p1.x - p2.x) / q,
            y: y3 + calc * (p1.z - p2.z) / q,
          z: z3 + calc * (p2.y - p1.y) / q }
          pArc_2 = {
            x: x3 - calc * (p1.x - p2.x) / q,
            y: y3 - calc * (p1.z - p2.z) / q,
          z: z3 - calc * (p2.y - p1.y) / q }

          if (((p1.y - pArc_1.y) * (p1.z + pArc_1.z)) + ((pArc_1.y - p2.y) * (pArc_1.z + p2.z)) >=
            ((p1.y - pArc_2.y) * (p1.z + pArc_2.z)) + ((pArc_2.y - p2.y) * (pArc_2.z + p2.z))) {
            cw = pArc_1
            ccw = pArc_2
          } else {
            cw = pArc_2
            ccw = pArc_1
          }
          break
        default:
          pArc_1 = {
            x: x3 + calc * (p1.y - p2.y) / q,
            y: y3 + calc * (p2.x - p1.x) / q,
          z: z3 + calc * (p2.z - p1.z) / q }
          pArc_2 = {
            x: x3 - calc * (p1.y - p2.y) / q,
            y: y3 - calc * (p2.x - p1.x) / q,
          z: z3 - calc * (p2.z - p1.z) / q }
          if (((p1.x - pArc_1.x) * (p1.y + pArc_1.y)) + ((pArc_1.x - p2.x) * (pArc_1.y + p2.y)) >=
            ((p1.x - pArc_2.x) * (p1.y + pArc_2.y)) + ((pArc_2.x - p2.x) * (pArc_2.y + p2.y))) {
            cw = pArc_1
            ccw = pArc_2
          } else {
            cw = pArc_2
            ccw = pArc_1
          }
      }

      if ((p2.clockwise === true && radius >= 0) || (p2.clockwise === false && radius < 0)) {
        vpArc = [cw.x, cw.y, cw.z]
      }
      else vpArc = [ccw.x, ccw.y, ccw.z]
    } else {
      // this code deals with IJK gcode commands
      /*if(args.clockwise === false || args.cmd === "G3")
        let pArc = {
        x: p2.arci ? p1.x + p2.arci : p1.x,
        y: p2.arcj ? p1.y + p2.arcj : p1.y,
        z: p2.arck ? p1.z + p2.arck : p1.z,
      ¨              }
        else*/
      const pArc = {
        x: p2.arci ? p1.x + p2.arci : p1.x,
        y: p2.arcj ? p1.y + p2.arcj : p1.y,
        z: p2.arck ? p1.z + p2.arck : p1.z
      }
      vpArc = [pArc.x, pArc.y, pArc.z]
    }

    const arcObj = drawArcFrom2PtsAndCenter(vp1, vp2, vpArc, args)
    // still push the normal p1/p2 point for debug
    p2.g2 = true
    p2.arcObj = arcObj
    group = getLineGroup(p2, args)
  // these golden lines showing start/end of a g2 or g3 arc were confusing people
  // so hiding them for now. jlauer 8/15/15
  /*
    geometry = group.geometry
    geometry.positions.push(
    [p1.x, p1.y, p1.z])
    geometry.positions.push(
    [p2.x, p2.y, p2.z))
    geometry.colors.push(group.color)
    geometry.colors.push(group.color)
  */
  } else {
    geometry.positions.push(p1.x, p1.y, p1.z)
    geometry.positions.push(p2.x, p2.y, p2.z)
    geometry.colors.push(group.color)
    geometry.colors.push(group.color)
  }

  if (p2.extruding) {
    bbox.min.x = Math.min(bbox.min.x, p2.x)
    bbox.min.y = Math.min(bbox.min.y, p2.y)
    bbox.min.z = Math.min(bbox.min.z, p2.z)
    bbox.max.x = Math.max(bbox.max.x, p2.x)
    bbox.max.y = Math.max(bbox.max.y, p2.y)
    bbox.max.z = Math.max(bbox.max.z, p2.z)
  }
  if (p2.g0) {
    // we're in a toolhead move, label moves
    /*
      if (group.segmentCount < 2) {
      makeSprite(scene, "webgl", {
      x: p2.x,
      y: p2.y,
      z: p2.z + 0,
      text: group.segmentCount,
      color: "#ff00ff",
      size: 3,
      })
      }
    */
  }
  // global bounding box calc
  bbox2.min.x = Math.min(bbox2.min.x, p2.x)
  bbox2.min.y = Math.min(bbox2.min.y, p2.y)
  bbox2.min.z = Math.min(bbox2.min.z, p2.z)
  bbox2.max.x = Math.max(bbox2.max.x, p2.x)
  bbox2.max.y = Math.max(bbox2.max.y, p2.y)
  bbox2.max.z = Math.max(bbox2.max.z, p2.z)

  /* NEW METHOD OF CREATING OBJECTS
  create new approach for objects which is
  a unique object for each line of gcode, including g2/g3's
  make sure userData is good too
  */
  let gcodeObj

  if (p2.arc) {
    // use the arc that already got built
    gcodeObj = p2.arcObj
  } else {
    // make a line
    let color = 0X0000ff
    /*const {extruding, g0, g2, arc} = p2
    const colorMap = {
      extruding: 0xff00ff,
      g0: 0x00ff00
    }*/

    if (p2.extruding) {
      color = 0xff00ff
    } else if (p2.g0) {
      color = 0x00ff00
    } else if (p2.g2) {
      // color = 0x999900
    } else if (p2.arc) {
      color = 0x0033ff
    }

    const material = {
      color: color,
      opacity: 0.5
    }
    gcodeObj = {geometry, material}
  }
  gcodeObj.p2 = p2
  gcodeObj.args = args
  state.container.children.push(gcodeObj)

  // DISTANCE CALC
  // add distance so we can calc estimated time to run
  // see if arc
  let dist = 0
  let a
  let b
  if (p2.arc) {
    // calc dist of all lines
    // console.log("this is an arc to calc dist for. p2.arcObj:", p2.arcObj, "p2:", p2)
    let arcGeo = p2.arcObj.geometry
    // console.log("arcGeo:", arcGeo)

    let tad2 = 0
    for (let arcLineCtr = 0; arcLineCtr < arcGeo.positions.length - 1; arcLineCtr++) {
      tad2 += arcGeo.positions[arcLineCtr].distanceTo(arcGeo.positions[arcLineCtr + 1])
    }
    // console.log("tad2:", tad2)

    // just do straight line calc
    a = [p1.x, p1.y, p1.z]
    b = [p2.x, p2.y, p2.z]
    // const straightDist = a.distanceTo(b)
    // console.log("diff of straight line calc vs arc sum. straightDist:", straightDist)
    dist = tad2
  } else {
    // just do straight line calc
    a = [p1.x, p1.y, p1.z]
    b = [p2.x, p2.y, p2.z]
    dist = a.distanceTo(b)
  }

  // Handle Laser Sxxx parameter
  sv = args.s
  // console.log(sv)

  // time distance computation
  if (dist > 0) {
    totalDist += dist
  }

  // time to execute this move
  // if this move is 10mm and we are moving at 100mm/min then
  // this move will take 10/100 = 0.1 minutes or 6 seconds
  let timeMinutes = 0
  if (dist > 0) {
    let feedrate
    if (args.feedrate > 0) {
      feedrate = args.feedrate
    } else {
      feedrate = 100
    }
    timeMinutes = dist / feedrate

    // adjust for acceleration, meaning estimate
    // this will run longer than estimated from the math
    // above because we don't start moving at full feedrate
    // obviously, we have to slowly accelerate in and out
    timeMinutes = timeMinutes * 1.32
  }

  totalTime += timeMinutes

  p2.feedrate = args.feedrate
  p2.dist = dist
  p2.distSum = totalDist
  p2.timeMins = timeMinutes
  p2.timeMinsSum = totalTime

  // console.log('Total Time'+totalTime)
  state.metrics.totaltimemax += (timeMinutes * 60)
  // console.log("calculating distance. dist:", dist, "totalDist:", totalDist, "feedrate:", args.feedrate, "timeMinsToExecute:", timeMinutes, "totalTime:", totalTime, "p1:", p1, "p2:", p2, "args:", args)
  return {
    dist,
  timeMinutes}
}

export function addFakeSegment (state, args) { // lineObject, lastLine, lines) {
  if (state.debug) {
    console.log('addFakeSegment')
  }
  closeLineSegment(state)
  // line.args = args
  const arg2 = {
    isFake: true,
    text: args.text,
    index: args.index,
    isComment: args.text.match(/^(;|\(|<)/)
  }
  state.lines.push({
    p2: state.lastLine, // since this is fake, just use lastLine as xyz
    args: arg2
  })
}

export function addLineSegment (state, args, p1, p2) {
  if(state.debug){
    console.log('addLineSegment')
  }
  let {lineObject, lasermultiply, bufSize} = state
  let i = lineObject.nLines * 6
  // lineObject.positions[i+0] = p1.x  // positions
  // lineObject.positions[i+1] = p1.y
  // lineObject.positions[i+2] = p1.z
  // lineObject.positions[i+3] = p2.x
  // lineObject.positions[i+4] = p2.y
  // lineObject.positions[i+5] = p2.z

  if (p1.a !== 0 || p2.a !== 0) { // A axis: rotate around X
    const R1 = Math.sqrt(p1.y * p1.y + p1.z * p1.z)
    const R2 = Math.sqrt(p2.y * p2.y + p2.z * p2.z)
    const a1 = p1.y === 0 ? Math.sign(p1.z) * 90 : Math.atan2(p1.z, p1.y) * 180.0 / Math.PI
    const a2 = p2.y === 0 ? Math.sign(p2.z) * 90 : Math.atan2(p2.z, p2.y) * 180.0 / Math.PI
    lineObject.positions[i + 0] = p1.x
    lineObject.positions[i + 1] = R1 * Math.cos((-p1.a + a1) * Math.PI / 180.0)
    lineObject.positions[i + 2] = R1 * Math.sin((-p1.a + a1) * Math.PI / 180.0)
    lineObject.positions[i + 3] = p2.x
    lineObject.positions[i + 4] = R2 * Math.cos((-p2.a + a2) * Math.PI / 180.0)
    lineObject.positions[i + 5] = R2 * Math.sin((-p2.a + a2) * Math.PI / 180.0)
  } else {
    //  Vertice code for A Axis as submitted by HakanBasted - commented out by PvdW else normal gcode only renders in a single Y line.
    // lineObject.positions[i+0] = p1.x  // positions
    // lineObject.positions[i+1] = 0.1*p1.a
    // lineObject.positions[i+2] = p1.z
    // lineObject.positions[i+3] = p2.x
    // lineObject.positions[i+4] = 0.1*p2.a
    // lineObject.positions[i+5] = p2.z

    lineObject.positions[i + 0] = p1.x // positions
    lineObject.positions[i + 1] = p1.y
    lineObject.positions[i + 2] = p1.z
    lineObject.positions[i + 3] = p2.x
    lineObject.positions[i + 4] = p2.y
    lineObject.positions[i + 5] = p2.z
  }
  // console.log("Segment " + p1)

  let color
  let intensity
  if (p2.g0) { // g0
    color = {r: 0, g: 1, b: 0}
    intensity = 1.0 - p2.s / lasermultiply
  } else if (p2.g1) { // g1
    color = {r: 0.7, g: 0, b: 0}
    intensity = 1.0 - p2.s / lasermultiply
  } else if (p2.g7) { // g7
    color = {r: 0, g: 0, b: 1}
    intensity = 1.0 - p2.s / lasermultiply
  } else {
    color = {r: 0, g: 1, b: 1}
    intensity = 1.0 - p2.s / lasermultiply
  }

  lineObject.colors[i + 0] = color.r + (1 - color.r) * intensity // Colors
  lineObject.colors[i + 1] = color.g + (1 - color.g) * intensity
  lineObject.colors[i + 2] = color.b + (1 - color.b) * intensity
  lineObject.colors[i + 3] = color.r + (1 - color.r) * intensity
  lineObject.colors[i + 4] = color.g + (1 - color.g) * intensity
  lineObject.colors[i + 5] = color.b + (1 - color.b) * intensity

  lineObject.nLines++

  if (lineObject.nLines === bufSize) {
    closeLineSegment(state)
  }

  const dist = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) + (p1.z - p2.z) * (p1.z - p2.z))
  // totalDist += dist
  // timeMinutes = dist / p2.f
  // totalTime += timeMinutes
  // totaltimemax = totalTime * 60
  return {dist}
}

export function closeLineSegment ({debug, lineObject, lineObjects}) {
  if(debug){
    console.log('closeLineSegment', lineObject.nLines)
  }
  if (lineObject.nLines === 0) {
    return
  }

  const positions = new Float32Array(6 * lineObject.nLines)
  const colors = new Float32Array(6 * lineObject.nLines)
  positions.set(lineObject.positions.subarray(0, lineObject.nLines * 6))
  colors.set(lineObject.colors.subarray(0, lineObject.nLines * 6))

  const lines = {positions, colors}
  lineObjects.lines.push(lines) // Feed the objects to "object" in doChunk()
  lineObject.nLines = 0
}
