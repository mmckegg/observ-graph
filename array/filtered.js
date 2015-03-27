var Observ = require('observ')
var Event = require('geval')
var nextTick = require('next-tick')

var MAGIC_NULL = {}

module.exports = FilteredGraphArray

function FilteredGraphArray (array, keyOrFn) {
  var obs = Observ()
  var refreshing = false
  var listeners = []
  var rawList = []
  var toBroadcast = []

  obs._list = []
  obs.size = Observ(0)
  obs.flush = flush

  var broadcastUpdate = null
  obs.onUpdate = Event(function (broadcast) {
    broadcastUpdate = broadcast
  })

  // init from existing items
  update([0, 0].concat(array._list))

  array.onUpdate(update)

  obs.get = function (index) {
    return obs._list[index]
  }
  obs.indexOf = function (item) {
    return obs._list.indexOf(item)
  }

  obs.forEach = function (iterator, ctx) {
    obs._list.forEach(iterator, ctx)
  }

  obs.map = function (keyOrIterator) {
    return FilteredGraphArray(obs, keyOrIterator)
  }

  return obs

  // scoped

  function refresh () {
    if (!refreshing) {
      nextTick(flush)
    }
    refreshing = true
  }

  function flush () {
    if (refreshing) {
      // get current state
      var newValue = rawList.slice()

      // set observable to current state
      obs.set(newValue)
      obs.size.set(obs._list.length)

      // broadcast accumulated splice updates
      toBroadcast.forEach(broadcastUpdate)
      toBroadcast = []

      refreshing = false
    }
  }

  function update (spliceDiff) {
    var mappedSplice = spliceDiff.map(spliceMapper(getValue))

    toBroadcast.push(mappedSplice)

    // [index, remove, inserts...]
    //
    // ['a', 'B', 'C', 'd', 'D']
    // filter if (s === s.toUpperCase())
    // -> ['a', 'd']
    //
    // how?
    //
    // keep array of lookups from list without NULLs to list with NULLs
    // -> [0, 4]
    //
    // keep array of lookups describing what index we would insert to if we were to add an object in our pre-filtered list to our filtered list
    // -> [0, 1, 1, 1, 2]
    //
    // example splices:
    //
    // [1, 0, 'e'] -> [1, 0, 'e']
    // -> ['a', 'd', 'e']
    //
    // [1, 0, 'F', 'g', 'E', 'h'] -> [1, 0, NULL, 'g', NULL, 'h']
    // -> broadcast splice of [1, 0, 'g', 'h']
    //
    //
    // [0, 1] -> ['a']

    obs._list.splice.apply(obs._list, mappedSplice)
    listeners.splice.apply(listeners, spliceDiff.map(spliceMapper(addListener)))
    rawList.splice.apply(rawList, spliceDiff.map(spliceMapper(getRawValue)))

    refresh()
  }

  function onInnerUpdate (item) {
    var index = obs._list.indexOf(item)
    if (~index) {
      rawList[index] = getRawValue(item)
      refresh()
    }
  }

  function spliceMapper (fn) {
    return function (item, i) {
      if (i > 1) {
        return fn(item)
      } else {
        return item
      }
    }
  }

  function getRawValue (item) {
    var value = getValue(item)
    return value ?
      item() :
      MAGIC_NULL
  }

  function getValue (item) {
    return (typeof keyOrFn === 'function') ?
      keyOrFn(item) :
      item[keyOrFn]
  }

  function addListener (item) {
    if (typeof item === 'function') {
      return item(onInnerUpdate)
    } else {
      return null
    }
  }
}
