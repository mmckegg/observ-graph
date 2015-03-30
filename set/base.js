var GraphCollectionBase = require('../lib/base')

module.exports = GraphSetBase

function GraphSetBase (parentContext) {
  var obs = GraphCollectionBase(parentContext)

  obs._set = new Set()
  obs._rawSet = new Set()
}
