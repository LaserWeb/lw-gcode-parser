export function parseLine (text, info) {
  // console.log('Parsing: ',text)
  const origtext = text

  if (text.match(/^N/i)) { // remove line numbers if exist
    text = text.replace(/^N\d+\s*/ig, '')// yes, there's a line num
  }

  const isG7 = text.match(/^G7/) // Is is G7 raster command?
  if (!isG7) { // G7 D-data need to be untouched
    text = text.replace(/G00/i, 'G0') // collapse leading zero g cmds to no leading zero
    text = text.replace(/G0(\d)/i, 'G$1') // add spaces before g cmds and xyzabcijkf params
    text = text.replace(/([gmtxyzabcijkfst])/ig, ' $1') // remove spaces after xyzabcijkf params because a number should be directly after them
    text = text.replace(/([xyzabcijkfst])\s+/ig, '$1') // remove front and trailing space
  }
  text = text.trim()

  let isComment = false
  if (text.match(/^(;|\(|<)/)) { // see if comment
    text = origtext
    isComment = true
  } else { // make sure to remove inline comments
    if (!isG7)
      text = text.replace(/\(.*?\)/g, '')
  }

  if (text && !isComment) {
    if (!isG7)
      text = text.replace(/(;|\().*$/, ''); // strip off end of line comment ; or () trailing

    let tokens = text.split(/\s+/)
    if (tokens) {
      var cmd = tokens[0] // check if a g or m cmd was included in gcode line
      cmd = cmd.toUpperCase() // you are allowed to just specify coords on a line
      // and it should be assumed that the last specified gcode
      // cmd is what's assumed
      isComment = false
      if (!cmd.match(/^(G|M|T)/i)) {
        cmd = this.lastArgs.cmd // we need to use the last gcode cmd
        tokens.unshift(cmd) // put at spot 0 in array
      } else {
        // we have a normal cmd as opposed to just an xyz pos where
        // it assumes you should use the last cmd
        // however, need to remove inline comments (TODO. it seems parser works fine for now)
      }
      const args = {
        'cmd': cmd,
        'text': text,
        'origtext': origtext,
        'indx': info,
        'isComment': isComment,
        'feedrate': null,
        'plane': undefined
      }

      if (tokens.length > 1 && !isComment) {
        tokens.splice(1).forEach(function (token) {
          if (token && token.length > 0) {
            var key = token[0].toLowerCase()
            if (!isG7) {
              var value = parseFloat(token.substring(1))
              if (isNaN(value)) {
                value = 0
              }
              args[key] = value
            } else { // Special treatment for G7 with D-data
              if (key == '$') key = 'dollar' // '$' doesn't work so well, use 'dollar'
              var value = token.substring(1) // Don't convert values to float, need the D-data
              args[key] = value
            }
          } else {
            // console.log("couldn't parse token in foreach. weird:", token)
          }
        })
      }
      let handler = handlers[cmd] || handlers['default']

      if (!args.isComment) { // don't save if saw a comment
        lastArgs = args
      }

      if (handler) {
        // do extra check here for units. units are
        // specified via G20 or G21. We need to scan
        // each line to see if it's inside the line because
        // we were only catching it when it was the first cmd
        // of the line.
        if (args.text.match(/\bG20\b/i)) {
          console.log('SETTING UNITS TO INCHES from pre-parser!!!')
          this.isUnitsMm = false // false means inches cuz default is mm
        } else if (args.text.match(/\bG21\b/i)) {
          console.log('SETTING UNITS TO MM!!! from pre-parser')
          this.isUnitsMm = true // true means mm
        }

        if (args.text.match(/F([\d.]+)/i)) { // scan for feedrate
          var feedrate = parseFloat(RegExp.$1) // we have a new feedrate
          args.feedrate = feedrate
          this.lastFeedrate = feedrate
        } else {
          args.feedrate = this.lastFeedrate // use feedrate from prior lines
        }

        return handler(args, info, this)
      } else {
        console.error('No handler for gcode command!!!')
      }
    }
  } else {
    // it was a comment or the line was empty
    // we still need to create a segment with xyz in p2
    // so that when we're being asked to /gotoline we have a position
    // for each gcode line, even comments. we just use the last real position
    // to give each gcode line (even a blank line) a spot to go to

    // REMOVE THIS ?

    const args = {
      'cmd': 'empty or comment',
      'text': text,
      'origtext': origtext,
      'indx': info,
      'isComment': isComment
    }
    var handler = handlers['default']
    return handler(args, info, this)
  }
}
