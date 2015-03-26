function getTypes (types) {
  return function (raw) {
    return types[raw.type]
  }
}

module.exports = {
  getTypes: getTypes
}
