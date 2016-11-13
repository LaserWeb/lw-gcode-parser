export default function makeBaseState (gcode, indexMax) {
  let state = {
    debug: true,

    tool: null,
    relative: false,
    isUnitsMm: true,

    lineObjects: {
      lines: [],
      nLines: 0,
      name: 'LineObjects'
    },

    extraObjects: {// these are extra Object3D elements added during
    // the gcode rendering to attach to scene
      'G17': [],
      'G18': [],
      'G19': []
    },
    plane: 'G17', // set default plane to G17 - Assume G17 if no plane specified in gcode.
    lines: [],

    layers: {
      layers3d: [],
      layer: undefined
    },

    metrics: {
      totalTime: 0,
      totaltimemax: 0,
      totalDist: 0
    },

    /*previous: {
      lastArgs: {cmd: null},
      lastFeedrate: null
    },*/
    lastArgs: {cmd: null},
    lastFeedrate: null,
    lastLine: {
      x: 0,
      y: 0,
      z: 0,
      a: 0,
      e: 0,
      f: 0,
      feedrate: null,
      extruding: false
    },

    bbox: {
      min: [100000, 100000, 100000],
      max: [-100000, -100000, -100000]
    },

    bbox2: {
      min: [100000, 100000, 100000],
      max: [-100000, -100000, -100000]
    },

    bufSize: 10000, // Arbitrary - play around with!

    lasermultiply: 100,
    laserxmax: undefined,
    laserymax: undefined,

    // command specific settings, not sure about this:
    specifics: {
      G0: {
        color: 0x00ff00
      },
      G1: {
        color: 0x0000ff
      },
      G2: {
        color: 0x999900
      },
      G7: {
        dir: 0,
        spotSize: undefined
      },
      G17: {
        extraObjects: []
      },
      G18: {
        extraObjects: []
      },
      G19: {
        extraObjects: []
      },
      G92: {
        offset: {x: 0, y: 0, z: 0, a: 0, e: 0}
      }
    },

    //container object/group
    container: {
      name: 'newobj',
      children: []
    }
  }

  // we have been using an approach where we just append
  // each gcode move to one monolithic geometry. we
  // are moving away from that idea and instead making each
  // gcode move be it's own full-fledged line object with
  // its own userData info
  // G2/G3 moves are their own child of lots of lines so
  // that even the simulator can follow along better

  return state
}
