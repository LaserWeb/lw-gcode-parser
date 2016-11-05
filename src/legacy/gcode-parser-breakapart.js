/*

  AUTHOR:  John Lauer
  -- S??? (laser intensity) Parameter Handling added by AUTHOR: Peter van der Walt
  v19/6/2016

*/

// This is a simplified and updated version of http://gcode.joewalnes.com/ that works with the latest version of Three.js (v68).
// Updated with code from http://chilipeppr.com/tinyg's 3D viewer to support more CNC type Gcode
var totaltimemax = ''
totaltimemax = 0

var lineObjects = new THREE.Object3D()
lineObjects.name = 'LineObjects'

function GCodeParser (handlers) {
  handlers = handlers || {}

  lastArgs = {cmd: null}
  lastFeedrate = null
  isUnitsMm = true
}
colorG0: 0x00ff00
colorG1: 0x0000ff
colorG2: 0x999900

  var bufSize = 10000; // Arbitrary - play around with!
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
  totalDist = 0
  totalTime = 0
  var relative = false
  var tool = null
  var cofg = this
  //parser = new GCodeParser(
