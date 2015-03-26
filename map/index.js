var Observ = require('observ')

module.exports = ObservGraphMap

function ObservGraphMap (context) {
  var obs = Observ()
  obs.size = Observ(0)

  obs.get = function (key) {}

  obs.remove = function (key) {}

  obs.move = function (obsOrKey, targetKey) {}

  obs.has = function (key) {}

  obs.move = function (obsOrIndex, targetIndex) {}

  obs.put = function (key, raw) {}

  obs.forEach = function (iterator) {}

  obs.map = function (keyOrIterator) {}

  obs.filter = function (keyOrIterator) {}

  return obs
}
