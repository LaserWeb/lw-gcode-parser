
export function updateTimeAndDistance(currentState, input){

  totaltimemax += (timeMinutes * 60)
  totalTime += timeMinutes

  return {
    totalTime,
    totaltimemax
  }
}


export function updateTimeAndDistance2(state, args, p1, p2){
  // DISTANCE CALC
  // add distance so we can calc estimated time to run
  // see if arc
  let dist = 0
  let a
  let b
  if (p2.arc) {
    // calc dist of all lines
    // console.log("this is an arc to calc dist for. p2.arcObj:", p2.arcObj, "p2:", p2)
    let arcGeo = p2.arcObj.geometry
    // console.log("arcGeo:", arcGeo)

    let tad2 = 0
    for (let arcLineCtr = 0; arcLineCtr < arcGeo.positions.length - 1; arcLineCtr++) {
      tad2 += arcGeo.positions[arcLineCtr].distanceTo(arcGeo.positions[arcLineCtr + 1])
    }
    // console.log("tad2:", tad2)

    // just do straight line calc
    a = [p1.x, p1.y, p1.z]
    b = [p2.x, p2.y, p2.z]
    // const straightDist = a.distanceTo(b)
    // console.log("diff of straight line calc vs arc sum. straightDist:", straightDist)
    dist = tad2
  } else {
    // just do straight line calc
    a = [p1.x, p1.y, p1.z]
    b = [p2.x, p2.y, p2.z]
    dist = a.distanceTo(b)
  }

  // Handle Laser Sxxx parameter
  //sv = args.s

  // time distance computation
  if (dist > 0) {
    state.metrics.totalDist += dist
  }

  // time to execute this move
  // if this move is 10mm and we are moving at 100mm/min then
  // this move will take 10/100 = 0.1 minutes or 6 seconds
  let timeMinutes = 0
  if (dist > 0) {
    let feedrate
    if (args.feedrate > 0) {
      feedrate = args.feedrate
    } else {
      feedrate = 100
    }
    timeMinutes = dist / feedrate

    // adjust for acceleration, meaning estimate
    // this will run longer than estimated from the math
    // above because we don't start moving at full feedrate
    // obviously, we have to slowly accelerate in and out
    timeMinutes = timeMinutes * 1.32
  }

  state.metrics.totalTime += timeMinutes

  p2.feedrate = args.feedrate
  p2.dist = dist
  p2.distSum = state.metrics.totalDist
  p2.timeMins = timeMinutes
  p2.timeMinsSum = state.metrics.totalTime

  // console.log('Total Time'+totalTime)
  state.metrics.totaltimemax += (timeMinutes * 60)
  // console.log("calculating distance. dist:", dist, "totalDist:", totalDist, "feedrate:", args.feedrate, "timeMinsToExecute:", timeMinutes, "totalTime:", totalTime, "p1:", p1, "p2:", p2, "args:", args)
}
