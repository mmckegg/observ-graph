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
  var obs = GraphArray({
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

  var firstMapped = obs.map(function (val) {
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

  // helper to check obs
  function check (vals) {
    flush()
    t.deepEqual(obs(), vals.map(function (val) {
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

  obs.set([
    { first: { second: { third: 'foo' } } },
    { first: { second: { third: 'bar' } } },
    { first: { second: { third: 'baz' } } }
  ])
  check(['foo', 'bar', 'baz'])

  obs.remove(1)
  check(['foo', 'baz'])

  obs.get(1).first.set({ second: { third: 'quack' } })
  check(['foo', 'quack'])

  obs.get(0).first.second.set({ third: 'chirp' })
  check(['chirp', 'quack'])

  obs.insert(1, { first: { second: { third: 'pom' } } })
  check(['chirp', 'pom', 'quack'])

  t.end()
})

// TODO improve test
test('multiple graphs', function (t) {
  var things = GraphArray({
    getType: function () {
      return function () {
        return ObservStruct({
          description: Observ(),
          ownerId: Observ()
        })
      }
    }
  })

  var agents = GraphArray({
    getType: function () {
      return function () {
        return ObservStruct({
          id: Observ()
        })
      }
    }
  })

  things.set([{
    description: 'a bicycle',
    ownerId: 'dinosaur'
  }, {
    description: 'a sailboat',
    ownerId: 'notdinosaur'
  }, {
    description: 'a skirt',
    ownerId: 'dinosaur'
  }])

  agents.set([{
    id: 'dinosaur'
  }])

  var owned = agents.map(function (agent) {
    var ownedByAgent = GraphArray()
    things.forEach(function (thing) {
      if (thing.ownerId() === agent.id()) {
        ownedByAgent.push(thing())
      }
    })
    return ownedByAgent
  })

  t.deepEqual(owned.get(0).get(0)(), things.get(0)())
  t.deepEqual(owned.get(0).get(1)(), things.get(2)())

  t.end()
})
