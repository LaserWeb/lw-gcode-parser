/**
 * @author kaosat-dev / https://github.com/kaosat-dev
 * @author kaosat-dev / https://github.com/kaosat-dev
 * for the initial inspiration and example code.
 * Credit goes to https://github.com/joewalnes/gcode-viewer
 * GCode descriptions come from:
 * http://reprap.org/wiki/G-code
 * http://en.wikipedia.org/wiki/G-code
 * SprintRun source code
 * Description: A gcode parser
**/
import makeHandlers from './gcodeHandlers'
import parseAsChunks from './parseAsChunks'
import makeBaseState from './makeBaseState'

export default function parse (data, doneCallback) {
  // const params = Object.assign({}, machineDefaults, parameters)
  const handlers = makeHandlers()
  let state = makeBaseState()

  // FIXME: not sure AT ALL where/when lineObject is supposed to be created
  state.lineObject = {
    active: false,
    positions: new Float32Array(6 * state.bufSize), // Start with bufSize line segments
    colors: new Float32Array(6 * state.bufSize), // Start with bufSize line segments
    nLines: 0
  },

  parseAsChunks(state, handlers, data, doneCallback)
}

/*export default function makeGcodeStream (parameters = {}) {

OLD code structure , for reference !
//main entry point !!
createObjectFromGCode(gcode, indexMax)
  => handlers = {
     gcode(G1 etc): function
       => drawArc
       => drawArcFrom2PtsAndCenter
       => addSegment
   }
  =>GCodeParser(handlers)
    =>parse
      =>doChunk
        =>parseLine
        convertLineGeometryToBufferGeometry
}*/
