export function newLayer (line, layers3d) {
  // console.log("layers3d:", layers3d, "layers3d.length", layers3d.length)
  let layer = {
    type: {},
    layer: layers3d.length,
    z: line.z
  }
  layers3d.push(layer)
  return layer
}
