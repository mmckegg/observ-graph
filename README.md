# observ-graph

observable graph collections

#### WORK IN PROGRESS

## API

each collection is created used as follows:

```
var collection = GraphCollection(context)
```

### context options

#### `getType`

`getType` is a function that given a raw JSON object, returns a observable constructor for that type of object. `getType` is called on every update to objects, and checked against the last constructor.

the default is:
```
function getType (raw) {
  return Observ
}`
```

a common example is:
```
function getType (raw) {
  return types[raw.type]
}
```

## Collections

### [GraphSet](./set/README.md)

### [GraphMap](./map/README.md)

### [GraphArray](./array/README.md)

### [One](./one/README.md)

### [Many](./many/README.md)
