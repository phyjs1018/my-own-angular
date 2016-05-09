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
})
