import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')
import parse from '../src/index'

test.cb('gcode parser tests: can parse gcode files', t => {
  const gcode = fs.readFileSync('./data/Rotary Axis GCode.gcode','utf8')
  parse(gcode, function(data){
    console.log('done with parsing',data.metrics)
    t.deepEqual(data.linesData.length, 5904)
    //t.deepEqual(data.positions.length / 3, 864) // we divide by three because each entry is 3 long
    //t.deepEqual(data.positions[0], -0.025066649541258812)
    //t.deepEqual(data.positions[data.positions.length - 1], 0.019999999552965164)
    t.end()
  })
  // this.timeout(5000)
  /*fs.createReadStream('./data/test.gcode', { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
    .pipe(makeStlStream())
    .pipe(concatStream(function (parsedgcode) {
      t.end()
    }))*/
})
