import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')

test.cb('gcode parser tests: can parse ascii gcode files', t => {
  // this.timeout(5000)
  fs.createReadStream('./data/test.gcode', { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
    .pipe(makeStlStream())
    .pipe(concatStream(function (parsedgcode) {
      t.end()
    }))
})
