import { absolute, delta } from './utils'
import { addSegment, addLineSegment, addFakeSegment } from './geometries/segments'
import { newLayer } from './layers'

export default function makeHandlers (params) {
  /*let state = {
    isUnitsMm: true,
    plane: undefined,
    relative: true,
    offsetG92: {x: 0, y: 0, z: 0, a: 0, e: 0},
    spotSizeG7: undefined,
    dirG7: 0
  }
  const lineObject = {}
  let lastLine = undefined
  let lines = undefined

  var lineObject = {active: false,
    positions: new Float32Array(6 * bufSize), // Start with bufSize line segments
    colors: new Float32Array(6 * bufSize), // Start with bufSize line segments
    nLines: 0,
  }
  */

  const handlers = {
    // set the g92 offsets for the parser - defaults to no offset
    // When doing CNC, generally G0 just moves to a new location
    // as fast as possible which means no milling or extruding is happening in G0.
    // So, let's color it uniquely to indicate it's just a toolhead move.
    G0: function (state, args, index) {
      const {lastLine} = state
      const newLine = {
        x: args.x !== undefined ? absolute(state.relative, lastLine.x, args.x) + state.specifics.G92.offset.x : lastLine.x,
        y: args.y !== undefined ? absolute(state.relative, lastLine.y, args.y) + state.specifics.G92.offset.y : lastLine.y,
        z: args.z !== undefined ? absolute(state.relative, lastLine.z, args.z) + state.specifics.G92.offset.z : lastLine.z,
        a: args.a !== undefined ? absolute(state.relative, lastLine.a, args.a) + state.specifics.G92.offset.a : lastLine.a,
        e: args.e !== undefined ? absolute(state.relative, lastLine.e, args.e) + state.specifics.G92.offset.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
        s: 100,
        g0: true
      }
      addLineSegment(state, args, lastLine, newLine)
      state.lastLine = newLine
    },
    G1: function (state, args, index) {
      const {lastLine, layer} = state
      // Example: G1 Z1.0 F3000
      //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
      //          G1 E104.25841 F1800.0
      // Go in a straight line from the current (X, Y) point
      // to the point (90.6, 13.8), extruding material as the move
      // happens from the current extruded length to a length of
      // 22.4 mm.

      const newLine = {
        x: args.x !== undefined ? absolute(state.relative, lastLine.x, args.x) + state.specifics.G92.offset.x : lastLine.x,
        y: args.y !== undefined ? absolute(state.relative, lastLine.y, args.y) + state.specifics.G92.offset.y : lastLine.y,
        z: args.z !== undefined ? absolute(state.relative, lastLine.z, args.z) + state.specifics.G92.offset.z : lastLine.z,
        a: args.a !== undefined ? absolute(state.relative, lastLine.a, args.a) + state.specifics.G92.offset.a : lastLine.a,
        e: args.e !== undefined ? absolute(state.relative, lastLine.e, args.e) + state.specifics.G92.offset.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
        s: args.s !== undefined ? args.s : lastLine.s,
        t: args.t !== undefined ? args.t : lastLine.t,
        g1: true
      }
      /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
      if (delta(lastLine.e, newLine.e) > 0) {
        newLine.extruding = delta(lastLine.e, newLine.e) > 0
        if (layer === undefined || newLine.z !== layer.z) {
          newLayer(newLine, state.layers.layers3d)
        }
      }
      addLineSegment(state, args, lastLine, newLine)
      state.lastLine = newLine
    },
    G2: function (state, args, index, gcp) {
      const {plane, lastLine} = state
      // this is an arc move from lastLine's xy to the new xy. we'll
      // show it as a light gray line, but we'll also sub-render the
      // arc itself by figuring out the sub-segments

      args.plane = plane // set the plane for this command to whatever the current plane is

      const newLine = {
        x: args.x !== undefined ? absolute(state.relative, lastLine.x, args.x) + state.specifics.G92.offset.x : lastLine.x,
        y: args.y !== undefined ? absolute(state.relative, lastLine.y, args.y) + state.specifics.G92.offset.y : lastLine.y,
        z: args.z !== undefined ? absolute(state.relative, lastLine.z, args.z) + state.specifics.G92.offset.z : lastLine.z,
        a: args.a !== undefined ? absolute(state.relative, lastLine.a, args.a) + state.specifics.G92.offset.a : lastLine.a,
        e: args.e !== undefined ? absolute(state.relative, lastLine.e, args.e) + state.specifics.G92.offset.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
        s: args.s !== undefined ? args.s : lastLine.s,
        t: args.t !== undefined ? args.t : lastLine.t,
        arci: args.i ? args.i : null,
        arcj: args.j ? args.j : null,
        arck: args.k ? args.k : null,
        arcr: args.r ? args.r : null,

        arc: true,
        clockwise: !args.clockwise ? true : args.clockwise // FIXME : always true ??
      }
      // if (args.clockwise === false) newLine.clockwise = args.clockwise
      addSegment(state, args, lastLine, newLine)
      state.lastLine = newLine
    },
    G3: function (state, args, index, gcp) {
      const {plane, lastLine} = state

      // this is an arc move from lastLine's xy to the new xy. same
      // as G2 but reverse
      args.arc = true
      args.clockwise = false
      args.plane = plane // set the plane for this command to whatever the current plane is

      const newLine = {
        x: args.x !== undefined ? absolute(state.relative, lastLine.x, args.x) + state.specifics.G92.offset.x : lastLine.x,
        y: args.y !== undefined ? absolute(state.relative, lastLine.y, args.y) + state.specifics.G92.offset.y : lastLine.y,
        z: args.z !== undefined ? absolute(state.relative, lastLine.z, args.z) + state.specifics.G92.offset.z : lastLine.z,
        a: args.a !== undefined ? absolute(state.relative, lastLine.a, args.a) + state.specifics.G92.offset.a : lastLine.a,
        e: args.e !== undefined ? absolute(state.relative, lastLine.e, args.e) + state.specifics.G92.offset.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
        s: args.s !== undefined ? args.s : lastLine.s,
        t: args.t !== undefined ? args.t : lastLine.t,
        arci: args.i ? args.i : null,
        arcj: args.j ? args.j : null,
        arck: args.k ? args.k : null,
        arcr: args.r ? args.r : null,

        arc: true,
        clockwise: !args.clockwise ? true : args.clockwise // FIXME : always true ??
      }
      // if (args.clockwise === false) newLine.clockwise = args.clockwise
      addSegment(state, args, lastLine, newLine)
      state.lastLine = newLine
    },

    G7: function (state, args, index) {
      const {lasermultiply, lastLine, lineObject, layer} = state
      // Example: G7 L68 D//////sljasflsfagdxsd,.df9078rhfnxm (68 of em)
      //          G7 $1 L4 DAAA=
      //          G7 $0 L4 D2312
      // Move right (if $1) or left (if $0) 51 steps (from L68)
      // (the number of steps is found when decoding the data)
      // and burn the laser with the intensity in the base64-encoded
      // data in D. Data in D is 51 base64-encoded bytes with grayscale
      // intensity. When base64-encoded the string becomes 68 bytes long.
      //
      // SpotSize comes from a previous M649 S100 R0.1
      // where S is intensity (100 is max) and R gives spotsize in mm.
      // Actual laser power is then D-value * S-value in every pixel
      // A direction change with $0/$1 gives a spotSize long movement in Y
      // for the next row.

      var buf = atob(args.d)

      if (typeof args.dollar !== 'undefined') { // Move Y, change direction
        state.specifics.G7.dir = args.dollar

        const newLine = {
          x: lastLine.x,
          y: lastLine.y + state.specifics.G7.spotSize,
          z: lastLine.z,
          a: lastLine.a,
          e: lastLine.e,
          f: lastLine.f,
          s: 100,
          t: lastLine.t,
          g0: true
        }
        addLineSegment(state, args, lastLine, newLine)
        state.lastLine = newLine
      }
      for (var i = 0; i < buf.length; i++) { // Process a base64-encoded chunk
        const intensity = 255 - buf.charCodeAt(i) // 255 - 0
        const newLine = {
          x: lastLine.x + state.specifics.G7.spotSize * (state.specifics.G7.dir === 1 ? 1 : -1),
          y: lastLine.y,
          z: lastLine.z,
          a: lastLine.a,
          e: lastLine.e,
          f: lastLine.f,
          s: intensity,
          t: lastLine.t,
          g7: true
        }
        addLineSegment(state, args, lastLine, newLine)
        state.lastLine = newLine
      }
    },

    G17: function (state, args) {
      console.log('SETTING XY PLANE')
      state.plane = 'G17'
      addFakeSegment(state, args)
    },

    G18: function (state, args) {
      console.log('SETTING XZ PLANE')
      state.plane = 'G18'
      addFakeSegment(state, args)
    },

    G19: function (state, args) {
      console.log('SETTING YZ PLANE')
      state.plane = 'G19'
      addFakeSegment(state, args)
    },

    G20: function (state, args) {
      // G21: Set Units to Inches
      // We don't really have to do anything since 3d viewer is unit agnostic
      // However, we need to set a global property so the trinket decorations
      // like toolhead, axes, grid, and extent labels are scaled correctly
      // later on when they are drawn after the gcode is rendered
      // console.log("SETTING UNITS TO INCHES!!!")
      state.isUnitsMm = false // false means inches cuz default is mm
      addFakeSegment(state, args)
    },

    G21: function (state, args) {
      // G21: Set Units to Millimeters
      // Example: G21
      // Units from now on are in millimeters. (This is the RepRap default.)
      // console.log("SETTING UNITS TO MM!!!")
      state.isUnitsMm = true // true means mm
      addFakeSegment(state, args)
    },

    G73: function (state, args, index, gcp) {
      // peck drilling. just treat as g1
      console.log('G73 gcp:', gcp)
      gcp.handlers.G1(args)
    },
    G90: function (state, args) {
      // G90: Set to Absolute Positioning
      // Example: G90
      // All coordinates from now on are absolute relative to the
      // origin of the machine. (This is the RepRap default.)

      state.relative = false
      addFakeSegment(state, args)
    },

    G91: function (state, args) {
      // G91: Set to Relative Positioning
      // Example: G91
      // All coordinates from now on are relative to the last position.

      // TODO!
      state.relative = true
      addFakeSegment(state, args)
    },

    G92: function (state, args) { // E0
      // G92: Set Position
      // Example: G92 E0
      // Allows programming of absolute zero point, by reseting the
      // current position to the values specified. This would set the
      // machine's X coordinate to 10, and the extrude coordinate to 90.
      // No physical motion will occur.

      // TODO: Only support E0
      var newLine = state.lastLine

      state.specifics.G92.offset.x = (args.x !== undefined ? (args.x === 0 ? newLine.x : newLine.x - args.x) : 0)
      state.specifics.G92.offset.y = (args.y !== undefined ? (args.y === 0 ? newLine.y : newLine.y - args.y) : 0)
      state.specifics.G92.offset.z = (args.z !== undefined ? (args.z === 0 ? newLine.z : newLine.z - args.z) : 0)
      state.specifics.G92.offset.a = (args.a !== undefined ? (args.a === 0 ? newLine.a : newLine.a - args.a) : 0)
      state.specifics.G92.offset.e = (args.e !== undefined ? (args.e === 0 ? newLine.e : newLine.e - args.e) : 0)

      // newLine.x = args.x !== undefined ? args.x + newLine.x : newLine.x
      // newLine.y = args.y !== undefined ? args.y + newLine.y : newLine.y
      // newLine.z = args.z !== undefined ? args.z + newLine.z : newLine.z
      // newLine.e = args.e !== undefined ? args.e + newLine.e : newLine.e

      // console.log("G92", lastLine, newLine, state, args.specifics.G92.offset)

      // state.lastLine = newLine
      addFakeSegment(state, args)
    },
    M30: function (state, args) {
      addFakeSegment(state, args)
    },
    M82: function (state, args) {
      // M82: Set E codes absolute (default)
      // Descriped in Sprintrun source code.

      // No-op, so long as M83 is not supported.
      addFakeSegment(state, args)
    },

    M84: function (state, args) {
      // M84: Stop idle hold
      // Example: M84
      // Stop the idle hold on all axis and extruder. In some cases the
      // idle hold causes annoying noises, which can be stopped by
      // disabling the hold. Be aware that by disabling idle hold during
      // printing, you will get quality issues. This is recommended only
      // in between or after printjobs.

      // No-op
      addFakeSegment(state, args)
    },

    M649: function (state, args) {
      // M649: Laser options for Marlin
      //  M649 S<Intensity> R<Spotsize> B2
      // Intensity = lasermultiply?
      if (typeof args.r !== 'undefined') { state.specifics.G7.spotSize = args.r }
    },

    // Dual Head 3D Printing Support
    T0: function (state, args) {
      // console.log('Found Tool: ', args)
      lastLine.t = 0
      addFakeSegment(state, args)
    },

    T1: function (state, args) {
      // console.log('Found Tool: ', args)
      lastLine.t = 1
      addFakeSegment(state, args)
    },

    'default': function (state, args, index) {
      // if (!args.isComment)
      //    console.log('Unknown command:', args.cmd, args, info)
      addFakeSegment(state, args)
    }
  }

  return handlers
}
