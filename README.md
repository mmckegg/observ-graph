var context = {
  getType: function(raw){
    return Observ
  }
}

ObservGraph(context)

getType is called on every update to objects, and checked against the last object ctor.

ObservStruct({
  role: One(map)
})

set.js

add(raw)
has(obs)
remove(obs)
size => Observ
forEach(fn)
map(keyOrFunction) => TypeSet
filter(keyOrFunction) => TypeSet
lookup(keyOrFunction) => TypeMap
sort(keyOrFunction) => TypeArray

map.js

get(key)
remove(key)
rename(obsOrKey, targetKey)
has(key)
put(key, raw)
keys => Observ
size => Observ
forEach(fn)
map(keyOrFunction) => TypeMap
filter(keyOrFunction) => TypeMap

toSet / values / whatever HOWEVER! => TypeSet

array.js

get(index)
remove(index)
push(raw)
insert(index, raw)
move(obsOrIndex, targetIndex) 
size => Observ
indexOf(obs)
forEach(fn)
map(keyOrFunction) => TypeArray
filter(keyOrFunction)

one.js

obs() => key
obs.set(key)
obs.get() => the actual observable
obs.onUpdate(listener) 
obs.get()(fn)


many.js 

Many(collection) => collection.filter(filter) (kinda)


















is a consistent interface possible between onUpdate varhash and array?

Lookup  { key: value | undefined }
List    [index, remove, insert, insert…]

should the interface match? or is it better to have it different so that duck typing works? 

Could be 2 different types:
get(index), getLength() => List
get(key), getKeys() => Lookup





Array

shared

onUpdate(listener)
get(key)

forEach
map
getLength()
keys
get