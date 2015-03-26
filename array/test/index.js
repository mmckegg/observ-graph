var test = require('tape')

var GraphArray = require('../')
var Observ = require('observ')
var ObservStruct = require('observ-struct')

var getTypes = require('../../lib/get-types')

test('type creation and update by .set()', function (t) {
  var obs = GraphArray({
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

  obs.set([
    { type: 'Test', value: 'foo' }
  ])

  var obj = obs.get(0)
  t.equal(obj.type, 'Test')
  t.deepEqual(obj(), { type: 'Test', value: 'foo' })

  obs.set([
    { type: 'Test', value: 'bar' }
  ])

  // make sure the object was not regenerated
  var obj2 = obs.get(0)
  t.equal(obj, obj2)

  var obj2destroyed = false
  obj2.destroy = function () {
    obj2destroyed = true
  }

  obs.set([
    { type: 'AnotherNode', value: 'bar' }
  ])

  t.ok(obj2destroyed, 'destroy called on object')

  // make sure the object was regenerated
  var obj3 = obs.get(0)
  t.notEqual(obj2, obj3)
  t.equal(obj3.type, 'AnotherNode')

  var obj3destroyed = false
  obj3.destroy = function () {
    obj3destroyed = true
  }

  obs.set([])
  t.ok(obj3destroyed, 'destroy called on object')

  t.end()
})

test('type add / remove by .set()', function (t) {
  var obs = GraphArray({
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

  obs.set([
    {type: 'Foo', value: 123},
    {type: 'Bar', value: 456}
  ])

  t.equal(obs.size(), 2)
  t.equal(obs.get(0).type, 'Foo')
  t.equal(obs.get(1).type, 'Bar')

  // check updates
  t.equal(changes.length, 1)
  t.equal(changes[0].length, 2 + 2)
  t.deepEqual(changes[0].slice(0, 2), [0, 0])
  t.equal(changes[0][2], obs.get(0)); t.equal(changes[0][3], obs.get(1))
  changes.length = 0

  obs.set([
    {type: 'Foo', value: 123},
    {type: 'Bar', value: 456},
    {type: 'Bar', value: 789}
  ])

  t.equal(obs.size(), 3)
  t.equal(obs.get(2).type, 'Bar')

  // check updates
  t.equal(changes.length, 1)
  t.equal(changes[0].length, 2 + 1)
  t.deepEqual(changes[0].slice(0, 2), [2, 0])
  t.equal(changes[0][2], obs.get(2))
  changes.length = 0

  obs.set([
    {type: 'Bar', value: 456},
    {type: 'Bar', value: 789}
  ])

  t.equal(obs.size(), 2)

  // check updates
  t.equal(changes.length, 2)
  t.equal(changes[0].length, 2 + 1)
  t.deepEqual(changes[0].slice(0, 2), [0, 1])
  t.equal(changes[0][2], obs.get(0))
  t.deepEqual(changes[1], [1, 1])

  t.end()
})

test('setting type updates parent state', function (t) {
  var obs = GraphArray({
    getType: getTypes({
      Test: function (context) {
        var obs = ObservStruct({
          value: Observ()
        })
        return obs
      }
    })
  })

  obs.set([
    { type: 'Test', value: 'foo' }
  ])

  var obj = obs.get(0)
  obj.value.set('bar')

  t.deepEqual(obs(), [{ type: 'Test', value: 'bar' }])

  t.end()
})

test('move a type by reference', function (t) {
  var obs = GraphArray({
    getType: getTypes({
      Test: function (context) {
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })
        return obs
      }
    })
  })

  obs.set([
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  var obj1 = obs.get(0)
  var obj2 = obs.get(1)
  var obj3 = obs.get(2)

  obs.move(obj2, 0)

  t.deepEqual(obs(), [
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  t.equal(obs.get(0), obj2)

  obs.move(obj1, 2)

  t.deepEqual(obs(), [
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' },
    { type: 'Test', id: '1', value: 'foo' }
  ])

  t.equal(obs.get(2), obj1)
  t.equal(obs.get(1), obj3)

  t.end()

})

test('push and insert a type by descriptor', function (t) {
  var obs = GraphArray({
    getType: getTypes({
      Test: function (context) {
        var obs = ObservStruct({
          id: Observ(),
          value: Observ()
        })
        return obs
      }
    })
  })

  obs.set([
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  obs.insert(1, { type: 'Test', id: '4', value: 'foobar'})

  t.deepEqual(obs(), [
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '4', value: 'foobar'},
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' }
  ])

  obs.push({ type: 'Test', id: '5', value: 'foobaz'})

  t.deepEqual(obs(), [
    { type: 'Test', id: '1', value: 'foo' },
    { type: 'Test', id: '4', value: 'foobar'},
    { type: 'Test', id: '2', value: 'bar' },
    { type: 'Test', id: '3', value: 'baz' },
    { type: 'Test', id: '5', value: 'foobaz'}
  ])

  t.deepEqual(obs.get(1)(), { type: 'Test', id: '4', value: 'foobar'})
  t.deepEqual(obs.get(4)(), { type: 'Test', id: '5', value: 'foobaz'})

  t.end()
})

test('change type from child', function (t) {
  var obs = GraphArray({
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

  obs.set([ { type: 'Foo', id: 'test', value: 456 } ])

  var obj = obs.get(0)
  t.equal(obj.type, 'Foo')

  obj.set({ type: 'Bar', id: 'test', value: 456 })

  var obj2 = obs.get(0)
  t.equal(obj2.value(), 456)
  t.equal(obj2.type, 'Bar')

  obj2.set({ type: 'Foo', id: 'test', value: 456 })

  var obj3 = obs.get(0)
  t.equal(obj3.type, 'Foo')

  t.end()
})
