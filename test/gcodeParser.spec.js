import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')
import parse from '../src/index'

test.cb('gcode parser: can parse gcode files', t => {
  const gcode = fs.readFileSync('../node_modules/lw-sample-files/gcode/Rotary Axis GCode.gcode', 'utf8')
  parse(gcode, function (data) {
    console.log('done with parsing', data.metrics)
    t.deepEqual(data.linesData.length, 5904)
    // t.deepEqual(data.positions.length / 3, 864) // we divide by three because each entry is 3 long
    // t.deepEqual(data.positions[0], -0.025066649541258812)
    // t.deepEqual(data.positions[data.positions.length - 1], 0.019999999552965164)
    t.end()
  })
/*fs.createReadStream('./data/test.gcode', { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
  .pipe(makeStlStream())
  .pipe(concatStream(function (parsedgcode) {
    t.end()
  }))*/
})


test.cb('gcode parser: can parse multi material 3d printer gcode', t => {
  const gcode = fs.readFileSync('../node_modules/lw-sample-files/gcode/3dp_dualExtrusion_UM3.gcode', 'utf8')
  parse(gcode, function (data) {
    console.log('done with parsing', data.metrics)
    t.deepEqual(data.linesData.length, 759060)
    t.end()
  })
})

test.cb('gcode parser: can parse multi material 3d printer gcode (variant2)', t => {
  const gcode = fs.readFileSync('../node_modules/lw-sample-files/gcode/Slicer Dual Example File loubie_aria_resculpt_base_and_eyes_v1.1.gcode', 'utf8')
  parse(gcode, function (data) {
    console.log('done with parsing', data.metrics)
    t.deepEqual(data.linesData.length, 3537558)
    t.end()
  })
})
