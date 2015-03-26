# observ-graph/array

## GraphArray

```js
var GraphArray = require('observ-graph/array')
var array = GraphArray(options)
```

**options**:

- [getType](../README.md#gettype)

### array.push(raw)

### array.insert(raw, index)

### array.get(index)

### array.indexOf(obs)

### array.remove(obs || index)

### array.move(obs || key, targetIndex)

### array.size

returns an observable value of the size

### forEach(fn)

### map(keyOrFunction)

returns a GraphArray

### filter(keyOrFunction)

returns a GraphArray

### lookup(keyOrFunction)

returns a GraphMap

### toSet()

returns a GraphSet
