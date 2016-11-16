export default function parseLine (state, handlers, text, index) {
  console.log('Parsing: ', text)
  const origtext = text

  if (text.match(/^N/i)) { // remove line numbers if exist
    text = text.replace(/^N\d+\s*/ig, '') // yes, there's a line num
  }
  const isG7 = text.match(/^G7/) // Is is G7 raster command?
  const baseParse = isG7 ? parseRaster(text, origtext) : parseDefault(text, origtext)
  const isComment = baseParse.isComment
  text = baseParse.text

  return generateArgs(state, handlers, text, origtext, index, isComment, isG7)
}

/*parses 'default' text , ie non raster/G7*/
function parseDefault (text, origtext) {
  let isComment = false

  text = text.replace(/G00/i, 'G0') // collapse leading zero g cmds to no leading zero
  text = text.replace(/G0(\d)/i, 'G$1') // add spaces before g cmds and xyzabcijkf params
  text = text.replace(/([gmtxyzabcijkfst])/ig, ' $1') // remove spaces after xyzabcijkf params because a number should be directly after them
  text = text.replace(/([xyzabcijkfst])\s+/ig, '$1') // remove front and trailing space
  text = text.trim()

  if (text.match(/^(;|\(|<)/)) { // see if comment
    text = origtext
    isComment = true
  } else {
    text = text.replace(/\(.*?\)/g, '')
  }

  text = text.replace(/(;|\().*$/, '') // strip off end of line comment ; or () trailing

  return {text, isComment}
}

/* parses...raster text ! (surprising isn't it?)*/
function parseRaster (text, origtext) {
  let isComment = false
  text = text.trim()
  if (text.match(/^(;|\(|<)/)) { // see if comment
    text = origtext
    isComment = true
  }
  return {text, isComment}
}

function generateArgs (state, handlers, text, origtext, index, isComment, isG7) {
  let {lastArgs} = state
  let args = { // defaults to an empty/comment line args
    cmd: 'empty or comment',
    text,
    origtext,
    index,
  isComment}

  if (text && !isComment) {
    let tokens = text.split(/\s+/)
    if (tokens) {
      let cmd = tokens[0].toUpperCase() // check if a g or m cmd was included in gcode line
      // you are allowed to just specify coords on a line
      // and it should be assumed that the last specified gcode
      // cmd is what's assumed
      if (!cmd.match(/^(G|M|T)/i)) {
        cmd = lastArgs.cmd // we need to use the last gcode cmd
        tokens.unshift(cmd) // put at spot 0 in array
      } else {
        // we have a normal cmd as opposed to just an xyz pos where
        // it assumes you should use the last cmd
        // however, need to remove inline comments (TODO. it seems parser works fine for now)
      }

      args = {
        cmd,
        text,
        origtext,
        index,
        isComment,
        feedrate: null,
        plane: undefined
      }

      if (tokens.length > 1) {
        tokens.splice(1).forEach(function (token) {
          if (token && token.length > 0) {
            let key = token[0].toLowerCase()
            let value
            if (!isG7) {
              value = parseFloat(token.substring(1))
              if (isNaN(value)) {
                value = 0
              }
              args[key] = value
            } else { // Special treatment for G7 with D-data
              if (key === '$') key = 'dollar' // '$' doesn't work so well, use 'dollar'
              value = token.substring(1) // Don't convert values to float, need the D-data
              args[key] = value
            }
          } else {
            // console.log("couldn't parse token in foreach. weird:", token)
          }
        })
      }

      if (!args.isComment) { // don't save if saw a comment
        state.lastArgs = args
      }
    }
  }
  // OTHERWISE it was a comment or the line was empty
  // we still need to create a segment with xyz in p2
  // so that when we're being asked to /gotoline we have a position
  // for each gcode line, even comments. we just use the last real position
  // to give each gcode line (even a blank line) a spot to go to

  // REMOVE THIS ?
  // return handlers['default'](args, index)
  let handler = handlers[args.cmd] || handlers['default']
  if (handler) {
    adaptUnitsAndFeedrateForHandler(args, state)
    return handler(state, args, index)
  } else {
    console.error('No handler for gcode command!!!')
  }

  //return args
}

//FIXME: switch to non mutating ?
function adaptUnitsAndFeedrateForHandler (args, state) {
  // do extra check here for units. units are
  // specified via G20 or G21. We need to scan
  // each line to see if it's inside the line because
  // we were only catching it when it was the first cmd
  // of the line.
  if (args.text.match(/\bG20\b/i)) {
    console.log('SETTING UNITS TO INCHES from pre-parser!!!')
    state.unitsMm = false // false means inches cuz default is mm
  } else if (args.text.match(/\bG21\b/i)) {
    console.log('SETTING UNITS TO MM!!! from pre-parser')
    state.unitsMm = true // true means mm
  }

  if (args.text.match(/F([\d.]+)/i)) { // scan for feedrate
    const feedrate = parseFloat(RegExp.$1) // we have a new feedrate
    args.feedrate = feedrate
    state.lastFeedrate = feedrate
  } else {
    args.feedrate = state.lastFeedrate // use feedrate from prior lines
  }
}
