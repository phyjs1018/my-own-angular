//watchCollection
describe('$watchCollection', function() {
  var scope

  beforeEach(function() {
    scope = new Scope()
  })

  //detecting non-collections changes
  it('works like a normal watch for non-collections', function() {
    var valueProvided

    scope.aValue = 42
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        valueProvided = newValue
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)
    expect(valueProvided).toBe(scope.aValue)

    scope.aValue = 43
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('works like a normal watch for NaNs', function() {
    scope.aValue = 0/0
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.$digest()
    expect(scope.counter).toBe(1)
  })

  //detection new arrays
  it('notices when the value becomes an array', function() {
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arr },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.arr = [1, 2, 3]
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('notices an item added to an array', function() {
    scope.arr = [1, 2, 3]
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arr },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.arr.push(4)
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('notices an item removed from an array', function() {
    scope.arr = [1, 2, 3]
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arr },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.arr.shift()
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  //detecting replacee or recordered items in arrays
  it('notices an item replaced in an array', function() {
    scope.arr = [1, 2, 3]
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arr },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.arr[1] = 42
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('notices items recordered in an array', function() {
    scope.arr = [2, 1, 3]
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arr },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.arr.sort()
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('does not fail on NaNs in arrays', function() {
    scope.arr = [2, NaN, 3]
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arr },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)
  })

  //array-like objects
  it('notices an item replaced in an arguments Object', function() {
    (function() {
      scope.arrayLike = arguments
    })(1, 2, 3)
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arrayLike },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.arrayLike[1] = 42
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('notices an item replaced in a NodeList object', function() {
    document.documentElement.appendChild(document.createElement('div'))
    scope.arrayLike = document.getElementsByTagName('div')

    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.arrayLike },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    document.documentElement.appendChild(document.createElement('div'))
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  //detecting new objects
  it('notices when the value becomes an object', function() {
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.obj },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.obj = {a: 1}
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  //detecting new or replaced attributes in objects
  it('notices when an attribute is added to an object', function() {
    scope.counter = 0
    scope.obj = {a: 1}

    scope.$watchCollection(
      function(scope) { return scope.obj },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.obj.b = 2
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('notices when an attribute is changed in an object', function() {
    scope.counter = 0
    scope.obj = {a: 1}

    scope.$watchCollection(
      function(scope) { return scope.obj },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    scope.obj.a = 2
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  it('does not fail on NaN attributes in objects', function() {
    scope.counter = 0
    scope.obj = {a: NaN}

    scope.$watchCollection(
      function(scope) { return scope.obj },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)
  })

  it('notices when an attribute is removed from an object', function() {
    scope.counter = 0
    scope.obj = {a: 1}

    scope.$watchCollection(
      function(scope) { return scope.obj },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()
    expect(scope.counter).toBe(1)

    delete scope.obj.a
    scope.$digest()
    expect(scope.counter).toBe(2)

    scope.$digest()
    expect(scope.counter).toBe(2)
  })

  //dealing with objects than have a length
  it('does not conside any object with a length property an array', function() {
    //when the length is 0, it can not work well
    //scope.obj = {length: 0, otherKey: 'abc}
    scope.obj = {length: 42, otherKey: 'abc'}
    scope.counter = 0

    scope.$watchCollection(
      function(scope) { return scope.obj },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    scope.$digest()

    scope.obj.newKey = 'def'
    scope.$digest()

    expect(scope.counter).toBe(2)
  })

  //handing the old collection value to listeners
  it('gives the old non-collection value to listeners', function() {
    scope.aValue = 42
    var oldValueGiven

    scope.$watchCollection(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        oldValueGiven = oldValue
      }
    )

    scope.$digest()

    scope.aValue = 43
    scope.$digest()

    expect(oldValueGiven).toBe(42)
  })

  it('gives the old array value to listeners', function() {
    scope.aValue = [1, 2, 3]
    var oldValueGiven

    scope.$watchCollection(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        oldValueGiven = oldValue
      }
    )

    scope.$digest()

    scope.aValue.push(4)
    scope.$digest()

    expect(oldValueGiven).toEqual([1, 2, 3])
  })

  it('gives the old object value to listeners', function() {
    scope.aValue = {a: 1, b: 2}
    var oldValueGiven

    scope.$watchCollection(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        oldValueGiven = oldValue
      }
    )

    scope.$digest()

    scope.aValue.c = 3
    scope.$digest()

    expect(oldValueGiven).toEqual({a: 1, b:2})
  })

  //discussed the role of oldValue on the first invocation
  it('uses the new value as the old value on first digest', function() {
    scope.aValue = {a: 1, b: 2}
    var oldValueGiven

    scope.$watchCollection(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        oldValueGiven = oldValue
      }
    )

    scope.$digest()

    expect(oldValueGiven).toEqual({a: 1, b:2})
  })
})
