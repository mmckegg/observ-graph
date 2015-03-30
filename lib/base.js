var Observ = require('observ')
var Event = require('geval')

module.exports = GraphCollectionBase

function GraphCollectionBase (parentContext) {
  parentContext = parentContext || {}

  var obs = Observ()

  obs._getType = parentContext.getType || defaultGetType
  obs._toBroadcast = []

  obs.context = Object.create(parentContext)
  obs.size = Observ(0)

  obs._broadcastUpdate = null
  obs.onUpdate = Event(function (broadcast) {
    obs._broadcastUpdate = broadcast
  })

  return obs
}

function defaultGetType (raw) {
  return Observ
}
