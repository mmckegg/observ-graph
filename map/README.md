# observ-graph/map

## GraphMap

```js
var GraphMap = require('observ-graph/map')
var map = GraphMap(options)
```

**options**:

- [getType](../README.md#gettype)

### map.put(key, raw)

### map.get(key)

### map.has(key)

### map.remove(obs || key)

### map.move(obs || key, targetKey)

### map.size

returns an observable value of the size

### map.keys

returns an observable value of the keys

### map.values

returns a GraphSet of the values

### forEach(fn)

### map(keyOrFunction)

returns an GraphMap

### filter(keyOrFunction)

returns an GraphMap
