var test = require('tape')

var GraphArray = require('../')
var Observ = require('observ')
var ObservStruct = require('observ-struct')
var computed = require('observ/computed')

var getTypes = require('./util').getTypes

test('map nested observ', function(t){
  var obs = GraphArray({
    getType: getTypes({
      Test: function(context){
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })

        obs.specialValue = computed([obs], function(data){
          return data.id + '-' + data.value
        })

        return obs
      }
    })
  })

  var values = obs.map('specialValue')

  obs.set([
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  var changes = []
  values(function(change){
    changes.push(change)
  })
 
  values.flush() // bypass nextTick

  t.equal(values.get(0), obs.get(0).specialValue)

  obs.remove(obs.get(1))
  values.flush()

  t.equal(changes.length, 2)
  t.deepEqual(changes[0], ['1-foo', '2-bar', '3-baz'])
  t.deepEqual(changes[1], ['1-foo', '3-baz'])

  t.end()
})

test('map nested observ with function', function(t){
  var obs = GraphArray({
    getType: getTypes({
      Test: function(context){
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })

        obs.specialValue = computed([obs], function(data){
          return data.id + '-' + data.value
        })

        return obs
      }
    })
  })

  var values = obs.map(function(x){
    return x.specialValue
  }, function(x){
    return x
  })

  obs.set([
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  var changes = []
  values(function(change){
    changes.push(change)
  })
 
  values.flush() // bypass nextTick

  t.equal(values.get(0), obs.get(0))

  obs.remove(obs.get(1))
  values.flush()

  t.equal(changes.length, 2)
  t.deepEqual(changes[0], ['1-foo', '2-bar', '3-baz'])
  t.deepEqual(changes[1], ['1-foo', '3-baz'])

  t.end()
})
