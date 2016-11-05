export function delta (v1, v2) {
  return relative ? v2 : v2 - v1
}

export function absolute (v1, v2) {
  return relative ? v1 + v2 : v2
}
