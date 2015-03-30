var test = require('tape')

var GraphSet = require('../')
var Observ = require('observ')
var ObservStruct = require('observ-struct')

var getTypes = require('../../lib/get-types')

test('.add(), .remove(), .has(), .set()', function (t) {
  var obs = GraphSet({
    getType: getTypes({
      Test: function Test (context) {
        var obs = Observ()
        obs.type = 'Test'
        return obs
      },
      AnotherNode: function AnotherNode (context) {
        var obs = Observ()
        obs.type = 'AnotherNode'
        return obs
      }
    })
  })

  var val1 = { type: 'Test', value: 'foo' }
  obs.add(val1)

  t.ok(obs.has(val1))
  var obj1 = obs.get(val1)
  t.equal(obj1.type, 'Test')
  t.deepEqual(obj1(), val1)

  var obj1destroyed = false
  obj1.destroy = function () {
    obj1destroyed = true
  }

  obs.remove(val1)

  t.ok(obj1destroyed, 'destroy called on object')
  t.notOk(obs.has(val1))

  var val2 = { type: 'Test', value: 'bar' }
  obs.add(val2)

  t.ok(obs.has(val2))
  var obj2 = obs.get(val2)
  t.notEqual(obj2, obj1)
  t.deepEqual(obj2(), val2)

  var val3 = { type: 'AnotherNode', value: 'baz' }
  obs.add(val3)
  
  t.ok(obs.has(val3))
  var obj3 = obs.get(val3)
  t.notEqual(obj3, obj1)
  t.notEqual(obj3, obj2)
  t.deepEqual(obj3(), val3)

  var obj3destroyed = false
  obj3.destroy = function () {
    obj3destroyed = true
  }

  obs.set([])

  t.ok(obj3destroyed, 'destroy called on object')
  t.notOk(obj.has(val2))
  t.notOk(obj.has(val3))

  t.end()
})

test('onUpdate changes', function (t) {
  var obs = GraphSet({
    getType: getTypes({
      Foo: function (context) {
        var obs = Observ()
        obs.type = 'Foo'
        return obs
      },
      Bar: function (context) {
        var obs = Observ()
        obs.type = 'Bar'
        return obs
      }
    })
  })

  var changes = []
  obs.onUpdate(function (change) {
    changes.push(change)
  })

  var val1 = {type: 'Foo', value: 123}
  var val2 = {type: 'Bar', value: 456}

  obs.set([val1, val2])

  t.equal(obs.size(), 2)
  t.equal(obs.get(val1).type, 'Foo')
  t.equal(obs.get(val2).type, 'Bar')

  // check updates
  t.equal(changes.length, 2)
  t.deepEqual(changes[0], {
    type: 'add',
    value: val1
  })
  t.deepEqual(changes[1], {
    type: 'add',
    value: val2
  })

  changes.length = 0

  var val3 = {type: 'Bar', value: 789}

  obs.set([val1, val2, val3])

  t.equal(obs.size(), 3)
  t.equal(obs.get(val3).type, 'Bar')

  // check updates
  t.equal(changes.length, 1)
  t.deepEqual(changes[0], {
    type: 'add',
    value: val3
  })

  changes.length = 0

  obs.set([val2, val3])

  t.equal(obs.size(), 2)

  // check updates
  t.equal(changes.length, 1)
  t.deepEqual(changes[0], {
    type: 'remove',
    value: val1
  })

  t.end()
})

test('setting type updates parent state', function (t) {
  var obs = GraphSet({
    getType: getTypes({
      Test: function (context) {
        var obs = ObservStruct({
          value: Observ()
        })
        return obs
      }
    })
  })

  var val = { type: 'Test', value: 'foo' }
  obs.set([val])

  var obj = obs.get(val)
  obj.value.set('bar')

  t.deepEqual(obs(), [{ type: 'Test', value: 'bar' }])

  t.end()
})

test('change type from child', function (t) {
  var obs = GraphSet({
    getType: getTypes({
      Foo: function Foo (context) {
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })

        obs.type = 'Foo'

        return obs
      },

      Bar: function Bar (context) {
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })

        obs.type = 'Bar'

        return obs
      }
    })
  })

  var val1 = { type: 'Foo', id: 'test', value: 456 }
  obs.set([val1])

  var obj1 = obs.get(val1)
  t.equal(obj1.type, 'Foo')

  var val2 = { type: 'Bar', id: 'test', value: 456 }
  obj1.set(val2)

  t.ok(obs.has(val2))
  var obj2 = obs.get(val2)
  t.equal(obj2.value(), 456)
  t.equal(obj2.type, 'Bar')

  var val3 = { type: 'Foo', id: 'test', value: 456 }
  obj2.set(val3)

  t.ok(obs.has(val3))
  var obj3 = obs.get(val3)
  t.equal(obj3.type, 'Foo')

  t.end()
})
