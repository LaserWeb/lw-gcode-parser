/*

  AUTHOR:  John Lauer
  -- S??? (laser intensity) Parameter Handling added by AUTHOR: Peter van der Walt
  v19/6/2016

*/

// This is a simplified and updated version of http://gcode.joewalnes.com/ that works with the latest version of Three.js (v68).
// Updated with code from http://chilipeppr.com/tinyg's 3D viewer to support more CNC type Gcode


var lineObjects = new THREE.Object3D()
lineObjects.name = 'LineObjects'

function GCodeParser (handlers) {
  handlers = handlers || {}

}


  var lineObject = {active: false,
    vertexBuf: new Float32Array(6 * bufSize), // Start with bufSize line segments
    colorBuf: new Float32Array(6 * bufSize), // Start with bufSize line segments
    nLines: 0,
  }
  var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors,
    opacity: 0.8,
    transparent: true,
    linewidth: 1,
  })
