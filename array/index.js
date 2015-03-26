var Observ = require('observ')
var Event = require('geval')

var NO_TRANSACTION = {}

module.exports = ObservGraphArray

function ObservGraphArray(parentContext){
  var obs = Observ()

  var getType = parentContext.getType || defaultGetType
  var listeners = []
  var rawList = []
  var typeList = []
  var toBroadcast = []

  var currentTransaction = NO_TRANSACTION

  obs._list = []
  obs.context = Object.create(parentContext)
  obs.size = Observ(0)

  var broadcastUpdate = null
  obs.onUpdate = Event(function(broadcast){
    broadcastUpdate = broadcast
  })

  obs.get = function(index){
    return obs._list[index]
  }

  obs.remove = function(itemOrIndex){
    var index = getIndex(itemOrIndex)

    if (~currentIndex){
      unlisten(index)
      splice(index, 1)
      refresh()
    }
  }

  obs.push = function(raw){
    return obs.insert(obs.size(), raw)
  }

  obs.insert = function(index, raw){
    var ctor = getType(raw)
    var item = ctor(obs.context)

    splice(index, 0, item)
    listen(index)
    refresh()

    return item
  }

  obs.move = function(itemOrIndex, targetIndex){
    var index = getIndex(itemOrIndex)
    var item =  getItem(itemOrIndex)

    splice(targetIndex, 0, item)
    splice(index, 1)
    refresh()
  }


  obs.indexOf = function(item){
    return obs._list.indexOf(item)
  }

  obs.forEach = function(iterator, ctx){
    obs._list.forEach(iterator, ctx)
  }

  obs.map = function(keyOrIterator){

  }

  obs.filter = function(keyOrIterator){

  }

  obs(function(data){
    if (currentTransaction === data){
      return false
    }

    currentTransaction = data

    if (!Array.isArray(data)){
      data = []
    }

    var maxLength = Math.max(data.length, rawList.length) 
    var minLength = Math.min(data.length, rawList.length) 
    var difference = data.length - rawList.length

    var updates = []
    for (var i=0;i<maxLength;i++){
      if (updateItem(i, data[i]) && i < minLength){
        updates.push([i, 1, obs._list[i]])
      }
    }

    // trim the excess
    typeList.length = rawList.length = listeners.length = obs._list.length = data.length

    // notify
    if (difference > 0){
      var u = [minLength, 0]
      for (var i=minLength;i<maxLength;i++){
        u.push(obs._list[i])
      }
      updates.push(u)
    } else if (difference < 0){
      updates.push([minLength-1, -difference])
    }

    currentTransaction = NO_TRANSACTION

    updates.forEach(broadcastUpdate)
  })

  return obs

  //

  function updateItem(index, raw){
    var item = obs._list[index]
    var ctor = getType(raw)

    var oldType = typeList[index]

    if (item && ctor === oldType){
      item.set(raw)
    } else {

      if (item){
        unlisten(index)
        item = null
      }

      obs._list[index] = null

      if (item){
        // create
        if (typeof ctor === 'function'){
          item = ctor(context)
          item.set(raw)
          obs._list[index] = item
          listen(index)
        }
      }

      return true
    }
  }

  function refresh(){
    // get current state
    var newValue = rawList.slice()

    // start transaction
    currentTransaction = newValue

    // set observable to current state
    obs.set(newValue)
    obs.size.set(obs._list.length)

    // broadcast accumulated splice updates
    toBroadcast.forEach(broadcastUpdate)
    toBroadcast = []

    // end transaction
    currentTransaction = NO_TRANSACTION
  }

  function getItem(itemOrIndex){
    return (itemOrIndex instanceof Object) ?
       itemOrIndex :
       obs._list[itemOrIndex]
  }

  function getIndex(itemOrIndex){
    return (itemOrIndex instanceof Object) ?
       obs._list.indexOf(itemOrIndex) :
       itemOrIndex
  }

  function splice(index, remove, insert){
    toBroadcast.push(toArray(arguments))
    obs._list.splice.apply(obs._list, arguments)
    listeners.splice.apply(listeners, arguments)
    rawList.splice.apply(rawList, arguments)
    typeList.splice.apply(typeList, arguments)
  }

  function listen(index){
    listeners[index] = item(function(){
      onInnerUpdate(item)
    })
  }

  function unlisten(index){
    if (listeners[index]){
      listeners[index]()
      listeners[index] = null
    }

    var item = obs._list[index]

    if (item && typeof item.destroy === 'function'){
      item.destroy()
    }
  }

  function onInnerUpdate(item){
    var index = obs._list.indexOf(item)
    var oldType = typeList[index]

    if (currentTransaction == NO_TRANSACTION){
      if (~index && oldType){

        var updates = []
        
        var raw = item()

        if (ctor !== oldType){
          if (updateItem(index, raw)){
            toBroadcast.push([index, 1, obs._list[index]])
          }
        }

        rawList[index] = raw
        refresh()
      }
    }
  }
}

function defaultGetType(raw){
  return Observ
}

function toArray (arr) {
  return Array.prototype.slice.call(arr)
}