const handlers = {
  // set the g92 offsets for the parser - defaults to no offset
  // When doing CNC, generally G0 just moves to a new location
  // as fast as possible which means no milling or extruding is happening in G0.
  // So, let's color it uniquely to indicate it's just a toolhead move.
  G0: function (args, indx) {
    var newLine = {
      x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
      y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
      z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
      a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
      e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
      f: args.f !== undefined ? args.f : lastLine.f,
      s: 100,
    }
    newLine.g0 = true
    cofg.addLineSegment(lastLine, newLine)
    lastLine = newLine
  },
  G1: function (args, indx) {
    // Example: G1 Z1.0 F3000
    //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
    //          G1 E104.25841 F1800.0
    // Go in a straight line from the current (X, Y) point
    // to the point (90.6, 13.8), extruding material as the move
    // happens from the current extruded length to a length of
    // 22.4 mm.

    var newLine = {
      x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
      y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
      z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
      a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
      e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
      f: args.f !== undefined ? args.f : lastLine.f,
      s: args.s !== undefined ? args.s : lastLine.s,
      t: args.t !== undefined ? args.t : lastLine.t,
    }
    /* layer change detection is or made by watching Z, it's made by
       watching when we extrude at a new Z position */
    if (cofg.delta(lastLine.e, newLine.e) > 0) {
      newLine.extruding = cofg.delta(lastLine.e, newLine.e) > 0
      if (layer == undefined || newLine.z != layer.z) cofg.newLayer(newLine)
    }
    newLine.g1 = true
    cofg.addLineSegment(lastLine, newLine)
    lastLine = newLine
  },
  G2: function (args, indx, gcp) {
    // this is an arc move from lastLine's xy to the new xy. we'll
    // show it as a light gray line, but we'll also sub-render the
    // arc itself by figuring out the sub-segments

    args.plane = plane // set the plane for this command to whatever the current plane is

    var newLine = {
      x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
      y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
      z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
      a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
      e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
      f: args.f !== undefined ? args.f : lastLine.f,
      s: args.s !== undefined ? args.s : lastLine.s,
      t: args.t !== undefined ? args.t : lastLine.t,
      arci: args.i ? args.i : null,
      arcj: args.j ? args.j : null,
      arck: args.k ? args.k : null,
      arcr: args.r ? args.r : null,
    }
    newLine.arc = true
    newLine.clockwise = true
    if (args.clockwise === false) newLine.clockwise = args.clockwise
    cofg.addSegment(lastLine, newLine, args)
    lastLine = newLine
  },
  G3: function (args, indx, gcp) {
    // this is an arc move from lastLine's xy to the new xy. same
    // as G2 but reverse
    args.arc = true
    args.clockwise = false
    args.plane = plane // set the plane for this command to whatever the current plane is

    var newLine = {
      x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
      y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
      z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
      a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
      e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
      f: args.f !== undefined ? args.f : lastLine.f,
      s: args.s !== undefined ? args.s : lastLine.s,
      t: args.t !== undefined ? args.t : lastLine.t,
      arci: args.i ? args.i : null,
      arcj: args.j ? args.j : null,
      arck: args.k ? args.k : null,
      arcr: args.r ? args.r : null,
    }
    newLine.arc = true
    newLine.clockwise = true
    if (args.clockwise === false) newLine.clockwise = args.clockwise
    cofg.addSegment(lastLine, newLine, args)
    lastLine = newLine
  },

  dirG7: 0,

  G7: function (args, indx) {
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
      this.dirG7 = args.dollar
      var newLine = {
        x: lastLine.x,
        y: lastLine.y + cofg.spotSizeG7,
        z: lastLine.z,
        a: lastLine.a,
        e: lastLine.e,
        f: lastLine.f,
        s: 100,
        t: lastLine.t,
      }
      newLine.g0 = true
      cofg.addLineSegment(lastLine, newLine)
      lastLine = newLine
    }
    for (var i = 0; i < buf.length; i++) { // Process a base64-encoded chunk
      var intensity = 255 - buf.charCodeAt(i); // 255 - 0
      var newLine = {
        x: lastLine.x + cofg.spotSizeG7 * (this.dirG7 == 1 ? 1 : -1),
        y: lastLine.y,
        z: lastLine.z,
        a: lastLine.a,
        e: lastLine.e,
        f: lastLine.f,
        s: intensity,
        t: lastLine.t,
      }
      newLine.g7 = true
      cofg.addLineSegment(lastLine, newLine)
      lastLine = newLine
    }
  },

  G17: function (args) {
    console.log('SETTING XY PLANE')
    plane = 'G17'
    cofg.addFakeSegment(args)
  },

  G18: function (args) {
    console.log('SETTING XZ PLANE')
    plane = 'G18'
    cofg.addFakeSegment(args)
  },

  G19: function (args) {
    console.log('SETTING YZ PLANE')
    plane = 'G19'
    cofg.addFakeSegment(args)
  },

  G20: function (args) {
    // G21: Set Units to Inches
    // We don't really have to do anything since 3d viewer is unit agnostic
    // However, we need to set a global property so the trinket decorations
    // like toolhead, axes, grid, and extent labels are scaled correctly
    // later on when they are drawn after the gcode is rendered
    // console.log("SETTING UNITS TO INCHES!!!")
    cofg.isUnitsMm = false // false means inches cuz default is mm
    cofg.addFakeSegment(args)
  },

  G21: function (args) {
    // G21: Set Units to Millimeters
    // Example: G21
    // Units from now on are in millimeters. (This is the RepRap default.)
    // console.log("SETTING UNITS TO MM!!!")
    cofg.isUnitsMm = true // true means mm
    cofg.addFakeSegment(args)
  },

  G73: function (args, indx, gcp) {
    // peck drilling. just treat as g1
    console.log('G73 gcp:', gcp)
    gcp.handlers.G1(args)
  },
  G90: function (args) {
    // G90: Set to Absolute Positioning
    // Example: G90
    // All coordinates from now on are absolute relative to the
    // origin of the machine. (This is the RepRap default.)

    relative = false
    cofg.addFakeSegment(args)
  },

  G91: function (args) {
    // G91: Set to Relative Positioning
    // Example: G91
    // All coordinates from now on are relative to the last position.

    // TODO!
    relative = true
    cofg.addFakeSegment(args)
  },

  G92: function (args) { // E0
    // G92: Set Position
    // Example: G92 E0
    // Allows programming of absolute zero point, by reseting the
    // current position to the values specified. This would set the
    // machine's X coordinate to 10, and the extrude coordinate to 90.
    // No physical motion will occur.

    // TODO: Only support E0
    var newLine = lastLine

    cofg.offsetG92.x = (args.x !== undefined ? (args.x === 0 ? newLine.x : newLine.x - args.x) : 0)
    cofg.offsetG92.y = (args.y !== undefined ? (args.y === 0 ? newLine.y : newLine.y - args.y) : 0)
    cofg.offsetG92.z = (args.z !== undefined ? (args.z === 0 ? newLine.z : newLine.z - args.z) : 0)
    cofg.offsetG92.a = (args.a !== undefined ? (args.a === 0 ? newLine.a : newLine.a - args.a) : 0)
    cofg.offsetG92.e = (args.e !== undefined ? (args.e === 0 ? newLine.e : newLine.e - args.e) : 0)

    // newLine.x = args.x !== undefined ? args.x + newLine.x : newLine.x
    // newLine.y = args.y !== undefined ? args.y + newLine.y : newLine.y
    // newLine.z = args.z !== undefined ? args.z + newLine.z : newLine.z
    // newLine.e = args.e !== undefined ? args.e + newLine.e : newLine.e

    // console.log("G92", lastLine, newLine, args, cofg.offsetG92)

    // lastLine = newLine
    cofg.addFakeSegment(args)
  },
  M30: function (args) {
    cofg.addFakeSegment(args)
  },
  M82: function (args) {
    // M82: Set E codes absolute (default)
    // Descriped in Sprintrun source code.

    // No-op, so long as M83 is not supported.
    cofg.addFakeSegment(args)
  },

  M84: function (args) {
    // M84: Stop idle hold
    // Example: M84
    // Stop the idle hold on all axis and extruder. In some cases the
    // idle hold causes annoying noises, which can be stopped by
    // disabling the hold. Be aware that by disabling idle hold during
    // printing, you will get quality issues. This is recommended only
    // in between or after printjobs.

    // No-op
    cofg.addFakeSegment(args)
  },

  M649: function (args) {
    // M649: Laser options for Marlin
    //  M649 S<Intensity> R<Spotsize> B2
    // Intensity = lasermultiply?
    if (typeof args.r !== 'undefined') { cofg.spotSizeG7 = args.r;}
  },

  // Dual Head 3D Printing Support
  T0: function (args) {
    // console.log('Found Tool: ', args)
    lastLine.t = 0
    cofg.addFakeSegment(args)
  },

  T1: function (args) {
    // console.log('Found Tool: ', args)
    lastLine.t = 1
    cofg.addFakeSegment(args)
  },

  'default': function (args, info) {
    // if (!args.isComment)
    //    console.log('Unknown command:', args.cmd, args, info)
    cofg.addFakeSegment(args)
  },
})
// console.log("Just before parser.parse: "+ gcode)
parser.parse(gcode)
}
