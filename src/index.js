/**
 * @author kaosat-dev / https://github.com/kaosat-dev
 * @author kaosat-dev / https://github.com/kaosat-dev
 *
 * Description: A gcode parser,
**/

import makeHandlers from './gcodeHandlers'
import parseAsChunks from './parseAsChunks'
import makeBaseData from './objFromGcode'

export default function parse(data, parameters={}){
  //const params = Object.assign({}, machineDefaults, parameters)

  const handlers = makeHandlers()
  let state = makeBaseData().state

  //FIXME: not sure AT ALL where/when lineObject is supposed to be created
  state.lineObject = {
    active: false,
    vertexBuf: new Float32Array(6 * state.bufSize), // Start with bufSize line segments
    colorBuf: new Float32Array(6 * state.bufSize), // Start with bufSize line segments
    nLines: 0
  },

  parseAsChunks(state, handlers, data)
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
