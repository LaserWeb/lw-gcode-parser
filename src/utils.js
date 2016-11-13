export function delta (relative, v1, v2) {
  return relative ? v2 : v2 - v1
}

export function absolute (relative, v1, v2) {
  return relative ? v1 + v2 : v2
}
