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
  this.extraObjects = []
  this.extraObjects['G17'] = []
  this.extraObjects['G18'] = []
  this.extraObjects['G19'] = []
  this.offsetG92 = {x: 0, y: 0, z: 0, a: 0, e: 0}

  var lastLine = {
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
  plane = 'G17'; // set default plane to G17 - Assume G17 if no plane specified in gcode.
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

  newLayer = function (line) {
    // console.log("layers3d:", layers3d, "layers3d.length", layers3d.length)
    layer = {
      type: {},
      layer: layers3d.length,
      z: line.z,
    }
    layers3d.push(layer)
  }

  getLineGroup = function (line, args) {
    console.log('getLineGroup:', line)
    if (layer == undefined) newLayer(line)
    var speed = Math.round(line.e / 1000)
    var opacity = line.s
    var tool = parseInt(line.t, 10)
    // /console.log('Speed: ' , speed , '  opacity: ', opacity)
    var grouptype = speed + opacity
    var color = null
    // var color = new THREE.Color(0x990000)

    if (typeof line.s === 'undefined') {
      opacity = 0.3
    } else {
      var lasermultiply = $('#lasermultiply').val() || 100
      opacity = line.s / lasermultiply
      console.log(opacity + ', ' + line.x)
    // }
    }
    // console.log(opacity)
    // LaserWeb 3D Viewer Colors
    // LaserWeb 3D Viewer Colors
    if (typeof line.extruding === 'undefined' && typeof line.s === 'undefined') {
      // console.log('G1 without extrude', line)
      grouptype = 'g0'
      opacity = 0.3
      color = new THREE.Color(0x00ff00)
    } else {
      // console.log('G1 with extrude', line)
      if (line.g0) {
        grouptype = 'g0'
        // color = new THREE.Color(0x00ff00)
        opacity = 0.3
        color = new THREE.Color(0x00ff00)
      } else if (line.g2) {
        grouptype = 'g2'
        // color = new THREE.Color(0x999900)
        color = new THREE.Color(0x990000)
      } else if (line.t == 0) {
        grouptype = 't0'
        // color = new THREE.Color(0x999900)
        color = new THREE.Color(0x0000ff)
      } else if (line.t == 1) {
        grouptype = 't1'
        // color = new THREE.Color(0x999900)
        color = new THREE.Color(0xff00ff)
      } else if (line.arc) {
        grouptype = 'arc'
        color = new THREE.Color(0x990000)
      } else {
        color = new THREE.Color(0x990000)
      }
    }

    // see if we have reached indxMax, if so draw, but
    // make it ghosted
    // if (args.indx > indxMax) {
    //    grouptype = "ghost"
    //    //console.log("args.indx > indxMax", args, indxMax)
    //    color = new THREE.Color(0x000000)
    // }
    // if (line.color) color = new THREE.Color(line.color)
    if (layer.type[grouptype] == undefined) {
      layer.type[grouptype] = {
        type: grouptype,
        feed: line.e,
        extruding: line.extruding,
        color: color,
        segmentCount: 0,
        material: new THREE.LineBasicMaterial({
          opacity: opacity,
          // opacity: line.extruding ? 0.5: line.g2 ? 0.2 : 0.3,
          transparent: true,
          linewidth: 1,
          vertexColors: THREE.FaceColors
        }),
        geometry: new THREE.Geometry(),
      }
    // if (args.indx > indxMax) {
    //   layer.type[grouptype].material.opacity = 0.05
    // }
    }
    return layer.type[grouptype]
  }
