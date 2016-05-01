//scope inheritance
describe('inheritance', function() {
  it('inherits the parent\'s properties', function() {
    var parent = new Scope()
    parent.aValue = [1, 2, 3]

    var child = parent.$new()

    expect(child.aValue).toEqual([1, 2, 3])
  })

  it('does not case a parent to inherit its properties', function() {
    var parent = new Scope()

    var child = parent.$new()
    child.aValue = [1, 2, 3]

    expect(parent.aValue).toBeUndefined()
  })

  it('inherits the parent\'s properties whenever they are defined', function() {
    var parent = new Scope()
    var child = parent.$new()

    parent.aValue = [1, 2, 3]

    expect(child.aValue).toEqual([1, 2, 3])
  })

  it('can manipulate a parent scope\'s property', function() {
    var parent = new Scope()
    var child = parent.$new()
    parent.aValue = [1, 2, 3]

    child.aValue.push(4)

    expect(child.aValue).toEqual([1, 2, 3, 4])
    expect(parent.aValue).toEqual([1, 2, 3, 4])
  })

  it('can watch a property in the parent', function() {
    var parent = new Scope()
    var child = parent.$new()
    parent.aValue = [1, 2, 3]
    child.counter = 0

    child.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      },
      true
    )

    child.$digest()
    expect(child.counter).toBe(1)

    parent.aValue.push(4)
    child.$digest()
    expect(child.counter).toBe(2)
  })

  it('can be nested at any depth', function() {
    var a = new Scope()
    var aa = a.$new()
    var aaa = aa.$new()
    var aab = aa.$new()
    var ab = a.$new()
    var abb = ab.$new()

    a.value = 1

    expect(aa.value).toBe(1)
    expect(aaa.value).toBe(1)
    expect(aab.value).toBe(1)
    expect(ab.value).toBe(1)
    expect(abb.value).toBe(1)

    ab.anotherValue = 2

    expect(abb.anotherValue).toBe(2)
    expect(aa.anotherValue).toBeUndefined()
    expect(aaa.anotherValue).toBeUndefined()
  })

  it('shadows a parent\'s property with the same name', function() {
    var parent = new Scope()
    var child = parent.$new()

    parent.name = 'Joe'
    child.name = 'Jill'

    expect(child.name).toBe('Jill')
    expect(parent.name).toBe('Joe')
  })

  it('does not shadow members of parent\'s attributes', function() {
    var parent = new Scope()
    var child = parent.$new()

    parent.user = {name: 'Jeo'}
    child.user.name = 'Jill'

    expect(child.user.name).toBe('Jill')
    expect(parent.user.name).toBe('Jill')
  })

  //separated watches
  it('does not digest its parent(s)', function() {
    var parent = new Scope()
    var child = parent.$new()

    parent.aValue = 'abc'
    parent.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.aValueWas = newValue
      }
    )

    child.$digest()
    expect(child.aValueWas).toBeUndefined()
  })

  //recursive digestion
  it('keeps a record of its children', function() {
    var parent = new Scope()
    var child1 = parent.$new()
    var child2 = parent.$new()
    var child2_1 = child2.$new()

    expect(parent.$$children.length).toBe(2)
    expect(parent.$$children[0]).toBe(child1)
    expect(parent.$$children[1]).toBe(child2)

    expect(child1.$$children.length).toBe(0)
    expect(child2.$$children.length).toBe(1)
    expect(child2.$$children[0]).toBe(child2_1)
  })

  it('digests its children', function() {
    var parent = new Scope()
    var child = parent.$new()

    parent.aValue = 'abc'
    child.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.aValueWas = newValue
      }
    )

    parent.$digest()
    expect(child.aValueWas).toBe('abc')
  })

  //digest the whole tree from $apply, $evalAsync, and $applyAsync
  it('digests from root on $apply', function() {
    var parent = new Scope()
    var child = parent.$new()
    var child2 = child.$new()

    parent.aValue = 'abc'
    parent.counter = 0
    parent.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    child2.$apply(function(scope) {})

    expect(parent.counter).toBe(1)
  })

  it('schedules a digest from root on $evalAsync', function(done) {
    var parent = new Scope()
    var child = parent.$new()
    var child2 = child.$new()

    parent.aValue = 'abc'
    parent.counter = 0
    parent.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

   child2.$evalAsync(function(scope) { })

   setTimeout(function() {
     expect(parent.counter).toBe(1)
     done()
   }, 50)
  })

  //isolated scope
  it('should not have access to parent attributes when isolated', function() {
    var parent = new Scope()
    var child = parent.$new(true)

    parent.aValue = 'abc'

    expect(child.aValue).toBeUndefined()
  })

  it('cannot watch parent attributes when isolated', function() {
    var parent = new Scope()
    var child = parent.$new(true)

    parent.aValue = 'abc'

    child.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.aValueWas = newValue
      }
    )

    child.$digest()
    expect(child.aValueWas).toBeUndefined()
  })

  it('digests its isolated children', function() {
    var parent = new Scope()
    var child = parent.$new(true)

    child.aValue = 'abc'
    child.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.aValueWas = newValue
      }
    )

    parent.$digest()
    expect(child.aValueWas).toBe('abc')
  })

  it('digests from root on $apply when isolated', function() {
    var parent = new Scope()
    var child = parent.$new(true)
    var child2 = child.$new()

    parent.aValue = 'abc'
    parent.counter = 0
    parent.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    child2.$apply(function() { })

    expect(parent.counter).toBe(1)
  })

  it('schedules a digest from root on $evalAsync when isolated', function(done) {
    var parent = new Scope()
    var child = parent.$new(true)
    var child2 = child.$new()

    parent.aValue = 'abc'
    parent.counter = 0
    parent.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      }
    )

    child2.$evalAsync(function() { })
    setTimeout(function() {
      expect(parent.counter).toBe(1)
      done()
    }, 50)
  })

  it('executes $evalAsync function on isolated scopes', function(done) {
    var parent = new Scope()
    var child = parent.$new(true)

    child.$evalAsync(function(scope) {
      scope.didEvalAsync = true
    })

    setTimeout(function() {
      expect(child.didEvalAsync).toBe(true)
      done()
    }, 50)
  })

  it('executes $$postDigest functions on isolated scopes', function() {
    var parent = new Scope()
    var child = parent.$new(true)

    child.$$postDigest(function() {
      child.didPostDigest = true
    })

    parent.$digest()

    expect(child.didPostDigest).toBe(true)
  })

  //substituting the parent scope
  it('can take some other scope as the parent', function() {
    var prototypeParent = new Scope()
    var hierarchyParent = new Scope()
    var child = prototypeParent.$new(false, hierarchyParent)

    prototypeParent.a = 42
    expect(child.a).toBe(42)

    child.counter = 0
    child.$watch(
      function(scope) {
        scope.counter++
      }
    )

    prototypeParent.$digest()
    expect(child.counter).toBe(0)

    hierarchyParent.$digest()
    expect(child.counter).toBe(2)
  })

  //destroying scopes
  it('is no longer digested when $destroy has been called', function() {
    var parent = new Scope()
    var child = parent.$new()

    child.aValue = [1, 2, 3]
    child.counter = 0
    child.$watch(
      function(scope) { return scope.aValue },
      function(newValue, oldValue, scope) {
        scope.counter++
      },
      true
    )

    parent.$digest()
    expect(child.counter).toBe(1)

    child.aValue.push(4)
    parent.$digest()
    expect(child.counter).toBe(2)

    child.$destroy()
    child.aValue.push(5)
    parent.$digest()
    expect(child.counter).toBe(2)
  })
})
