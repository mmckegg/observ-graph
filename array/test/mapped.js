var test = require('tape')

var GraphArray = require('../')
var Observ = require('observ')
var ObservStruct = require('observ-struct')
var computed = require('observ/computed')

var getTypes = require('../../lib/get-types')

test('map nested observ', function (t) {
  var obs = GraphArray({
    getType: getTypes({
      Test: function (context) {
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })

        obs.specialValue = computed([obs], function (data) {
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
  values(function (change) {
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

test('map nested observ with function', function (t) {
  var obs = GraphArray({
    getType: getTypes({
      Test: function (context) {
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })

        obs.specialValue = computed([obs], function (data) {
          return data.id + '-' + data.value
        })

        return obs
      }
    })
  })

  var values = obs.map(function (x) {
    return x.specialValue
  })

  obs.set([
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  var changes = []
  values(function (change) {
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

test('multiple maps', function (t) {
  var values = GraphArray({
    getType: function () {
      return function (context) {
        return (
          ObservStruct({
            first: ObservStruct({
              second: ObservStruct({
                third: Observ()
              })
            })
          })
        )
      }
    }
  })

  var firstMapped = values.map(function (val) {
    return val.first
  })

  var secondMapped = firstMapped.map(function (val) {
    return val.second
  })

  var thirdMapped = secondMapped.map(function (val) {
    return val.third
  })

  var thirdChanges = []
  thirdMapped(function (val) {
    thirdChanges.push(val)
  })

  // helper to bypass nextTick
  function flush () {
    ;[ firstMapped, secondMapped, thirdMapped ]
      .forEach(function (x) { x.flush() })
  }

  // helper to check values
  function check (vals) {
    flush()
    t.deepEqual(values(), vals.map(function (val) {
      return { first: { second: { third: val } } }
    }))
    t.deepEqual(firstMapped(), vals.map(function (val) {
      return { second: { third: val } }
    }))
    t.deepEqual(secondMapped(), vals.map(function (val) {
      return { third: val }
    }))
    t.deepEqual(thirdMapped(), vals)
  }

  values.set([
    { first: { second: { third: 'foo' } } },
    { first: { second: { third: 'bar' } } },
    { first: { second: { third: 'baz' } } }
  ])
  check(['foo', 'bar', 'baz'])

  values.remove(1)
  check(['foo', 'baz'])

  values.get(1).first.set({ second: { third: 'quack' } })
  check(['foo', 'quack'])

  values.get(0).first.second.set({ third: 'chirp' })
  check(['chirp', 'quack'])

  values.insert(1, { first: { second: { third: 'pom' } } })
  check(['chirp', 'pom', 'quack'])

  t.end()
})
