import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')
import parse from '../src/index'

test.cb('gcode parser tests: can parse gcode files', t => {
  const gcode = fs.readFileSync('./data/Rotary Axis GCode.gcode','utf8')
  parse(gcode)
  // this.timeout(5000)
  /*fs.createReadStream('./data/test.gcode', { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
    .pipe(makeStlStream())
    .pipe(concatStream(function (parsedgcode) {
      t.end()
    }))*/
})
