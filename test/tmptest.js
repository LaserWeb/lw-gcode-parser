import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')
import parse from '../src/parse'

const gcode = fs.readFileSync('./data/Rotary Axis GCode.gcode')
parse(gcode)
