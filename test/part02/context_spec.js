//lookup and function call expressions
describe('parse context', function() {
  it('looks up an attribute from the scope', function() {
    var fn = parse('akey')
    expect(fn({akey: 42})).toBe(42)
    expect(fn({})).toBeUndefined()
    expect(fn()).toBeUndefined()
  })

  it('looks up a 2-part identifier path from the scope', function() {
    var fn = parse('akey.anotherkey')
    expect(fn({akey: {anotherkey: 42}})).toBe(42)
    expect(fn({akey: {}})).toBeUndefined()
    expect(fn({})).toBeUndefined()
  })

  //arbitrarily nested attribute lookup
  it('looks up a 4-part identifier path from the scope', function() {
    var fn = parse('akey.secondkey.thirdkey.fourthkey')
    expect(fn({akey: {secondkey: {thirdkey: {fourthkey: 42}}}})).toBe(42)
    expect(fn({akey: {secondkey: {thirdkey: {}}}})).toBeUndefined()
    expect(fn()).toBeUndefined()
  })

  //locals
  it('uses the locals instead of scope when there is a matching key', function() {
    var fn = parse('akey')
    expect(fn({akey: 42}, {akey: 43})).toBe(43)
  })

  it('does not use locals instead of scope when there is no matching key', function() {
    var fn = parse('akey')
    expect(fn({akey: 42}, {anotherkey: 43})).toBe(42)
  })

  it('uses locals instead of scope when the first part matches' , function() {
    var fn = parse('aKey.anotherKey')
    expect(fn({aKey: {anotherKey: 42}}, {aKey: {}})).toBeUndefined()
  })

  it('uses locals when there is a matching local 4-part key' , function() {
    var fn = parse('aKey.key2.key3.key4');
    expect(fn(
      {aKey: {key2: {key3: {key4: 42}}}},
      {aKey: {key2: {key3: {key4: 43}}}}
    )).toBe(43);
  })

  //square bracket property access
  it('parses a simple string property access', function() {
    var fn = parse('akey["anotherkey"]')
    expect(fn({akey: {anotherkey: 42}})).toBe(42)
  })

  it('parses a memeric array access', function() {
    var fn = parse('anArray[1]')
    expect(fn({anArray: [1, 2, 3]})).toBe(2)
  })

  it('parses a property access with another key as property', function() {
    var fn = parse('akey[key]')
    expect(fn({key: 'theKey', akey: {theKey: 42}})).toBe(42)
  })

  it('parses property access with another access as property', function() {
    var fn = parse('lock[keys["aKey"]]')
    expect(fn({keys: {aKey: 'theKey'}, lock: {theKey: 42}})).toBe(42)
  })

  //field access
  it('parses a field access after a property access', function() {
    var fn = parse('aKey["anotherKey"].aThirdKey')
    expect(fn({aKey: {anotherKey: {aThirdKey: 42}}})).toBe(42)
  })

  it('parses a chain of property and field accesses', function() {
    var fn = parse('aKey["anotherKey"].aThirdKey["aFourthKey"]')
    expect(fn({aKey: {anotherKey: {aThirdKey: {aFourthKey: 42}}}})).toBe(42)
  })

  //function calls
  it('parses a function call', function() {
    var fn = parse('aFunction()')
    expect(fn({aFunction: function() { return 42 }})).toBe(42)
  })

  it('parses a function call with a single number argument', function() {
    var fn = parse('aFunction(42)')
    expect(fn({aFunction: function(n) { return n }})).toBe(42)
  })

  it('parses a function call with a single identifier argument', function() {
    var fn = parse('aFunction(argFn())')
    expect(fn({
      argFn: _.constant(42),
      aFunction: function(arg) { return arg }
    })).toBe(42)
  })

  it('parses a function call with multiple arguments', function() {
    var fn = parse('aFunction(37, n, argFn())')
    expect(fn({
      n: 3,
      argFn: _.constant(2),
      aFunction: function(a1, a2, a3) { return a1 + a2 + a3 }
    })).toBe(42)
  })

  //Ensuring safety in member access
  it('does not allow calling the function constructor', function() {
    expect(function() {
      var fn = parse('aFunction.constructor("return window")()')
      fn({aFunction: function() {}})
    }).toThrow()
  })

  it('does not allow accessing __proto__', function() {
    expect(function() {
      var fn = parse('obj.__proto__')
      fn({obj: { }})
    }).toThrow()
  })

  it('does not allow calling __defineGetter__', function() {
    expect(function() {
      var fn = parse('obj.__defineGetter__("evil", fn)')
      fn({obj: {}, fn: function() { }})
    }).toThrow()
  })

  it('does not allow calling __lookupGetter__', function() {
    expect(function() {
      var fn = parse('obj.__lookupGetter__("evil")')
      fn({obj: { }})
    }).toThrow()
  })

  //method calls
  it('calls functions accessed as properties with the correct this', function() {
    var scope = {
      anObject: {
        aMember: 42,
        aFunction: function() {
          return this.aMember
        }
      }
    }
    var fn = parse('anObject["aFunction"]()')
    expect(fn(scope)).toBe(42)
  })

  it('calls function accessed as fields with the correct this', function() {
    var scope = {
      anObject: {
        aMember: 42,
        aFunction: function() {
          return this.aMember
        }
      }
    }
    var fn = parse('anObject.aFunction()')
    expect(fn(scope)).toBe(42)
  })

  it('calls methods with whitespace before function call', function() {
    var scope = {
      anObject: {
        aMember: 42,
        aFunction: function() {
          return this.aMember
        }
      }
    }
    var fn = parse('anObject.aFunction  ()')
    expect(fn(scope)).toBe(42)
  })

  it('clears the this context on function calls', function() {
    var scope = {
      anObject: {
        aMember: 42,
        aFunction: function() {
          return function() {
            return this.aMember
          }
        }
      }
    }
    var fn = parse('anObject.aFunction()()')
    expect(fn(scope)).toBeUndefined()
  })

  //enduring safe objects
  it('does not allow accessing window as property', function() {
    var fn = parse('anObject["wnd"]')
    expect(function() { fn({anObject: {wnd: window}})}).toThrow()
  })

  it('does not allow calling function of window', function() {
    var fn = parse('wnd.scroll(500, 0)')
    expect(function() { fn({wnd: window})}).toThrow()
  })

  it('does not allow function to return window', function() {
    var fn = parse('getWnd()')
    expect(function() { fn({getWnd: _.constant(window)})}).toThrow()
  })

  //ensuring safe functions
  it('does not allow calling call', function() {
    var fn = parse('fun.call(obj)')
    expect(function() { fn({fun: function() { }, obj: {}})}).toThrow()
  })

  //assigning values
  it('parses a simple attribute assignment', function() {
    var fn = parse('anAttribute = 42')
    var scope = {}
    fn(scope)
    expect(scope.anAttribute).toBe(42)
  })

  //parses a nested attribute assignment
  it('parses a nested attributes assignment', function() {
    var fn = parse('anObject.anAttribute = 42')
    var scope = {anObject: {}}
    fn(scope)
    expect(scope.anObject.anAttribute).toBe(42)
  })

  it('creates the objects in the setter path that do not exist', function() {
    var fn = parse('some.nested.path = 42')
    var scope = {}
    fn(scope)
    expect(scope.some.nested.path).toBe(42)
  })

  it('parses an assignment through attribute access', function() {
    var fn = parse('anObject["anAttribute"] = 42')
    var scope = {anObject: {}}
    fn(scope)
    expect(scope.anObject.anAttribute).toBe(42)
  })
  
  it('parses assignment through field access after something else', function() {
    var fn = parse('anObject["otherObject"].nested = 42')
    var scope = {anObject: {otherObject: {}}}
    fn(scope)
    expect(scope.anObject.otherObject.nested).toBe(42)
  })
  
  //arrays and objects revisited
  it('parses an array with non-literals', function() {
    var fn = parse('[a, b, c()]')
    expect(fn({a: 1, b: 2, c: _.constant(3)})).toEqual([1, 2, 3])
  })
  
  it('parses an object with non-literals', function() {
    var fn = parse('{a: a, b: obj.c()}')
    expect(fn({
      a: 1,
      obj: {
        b: _.constant(2),
        c: function() {
          return this.b()
        }
      }
    })).toEqual({a: 1, b: 2})
  })
})
