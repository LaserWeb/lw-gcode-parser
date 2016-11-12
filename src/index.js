/**
 * @author kaosat-dev / https://github.com/kaosat-dev
 * @author kaosat-dev / https://github.com/kaosat-dev
 *
 * Description: A gcode parser,
**/

//import makeHandlers from './gcodeHandlers'
import parseAsChunks from './parseAsChunks'
import makeBaseData from './objFromGcode'

export default function parse(data, parameters={}){

  const defaults ={
    laserxmax: 0,
    laserymax: 0
  }

  const {state} = makeBaseData()
  parseAsChunks(data, state, defaults)
  //const gCodeHandlers = makeHandlers()
}


  /*export default function makeGcodeStream (parameters = {}) {

  OLD code structure , for reference !
  //main entry point !!
  createObjectFromGCode(gcode, indxMax)
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
