export function keyFromName (name) {
  return name
    .toLowerCase()
    .replace(/\s/g, '')
}

export function isSelected (ballot = [], value) {
  return ballot.indexOf(value) > -1
}
