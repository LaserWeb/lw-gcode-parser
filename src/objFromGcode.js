createObjectFromGCode = function (gcode, indxMax) {
  console.group('Generating GCODE Preview')
  // console.group("Rendering GCODE Preview")
  // debugger
  // Credit goes to https://github.com/joewalnes/gcode-viewer
  // for the initial inspiration and example code.
  //
  // GCode descriptions come from:
  //    http://reprap.org/wiki/G-code
  //    http://en.wikipedia.org/wiki/G-code
  //    SprintRun source code

  // these are extra Object3D elements added during
  // the gcode rendering to attach to scene

  const state = {
    extraObjects: {
      'G17': [],
      'G18': [],
      'G19': []
    },
    offsetG92 : {x: 0, y: 0, z: 0, a: 0, e: 0}
  }

  let lastLine = {
    x: 0,
    y: 0,
    z: 0,
    a: 0,
    e: 0,
    f: 0,
    feedrate: null,
    extruding: false,
  }

  // we have been using an approach where we just append
  // each gcode move to one monolithic geometry. we
  // are moving away from that idea and instead making each
  // gcode move be it's own full-fledged line object with
  // its own userData info
  // G2/G3 moves are their own child of lots of lines so
  // that even the simulator can follow along better
  var new3dObj = new THREE.Group()
  new3dObj.name = 'newobj'

  plane = 'G17' // set default plane to G17 - Assume G17 if no plane specified in gcode.

  layers3d = []
  layer = undefined

  lines = []

  totalDist = 0
  
  bbbox = {
    min: {
      x: 100000,
      y: 100000,
      z: 100000
    },
    max: {
      x: -100000,
      y: -100000,
      z: -100000
    }
  }
  bbbox2 = {
    min: {
      x: 100000,
      y: 100000,
      z: 100000
    },
    max: {
      x: -100000,
      y: -100000,
      z: -100000
    }
  }
}
