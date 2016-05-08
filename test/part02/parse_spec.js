describe('parse', function() {
  it('can parse an interger', function() {
    var fn = parse('42')
    expect(fn).toBeDefined()
    expect(fn()).toBe(42)
  })

  //marking literals and constants
  it('makes intergers both constant and literal', function() {
    var fn = parse('42')
    expect(fn.constant).toBe(true)
    expect(fn.literal).toBe(true)
  })

  //Parsing Floating Point Numbers
  it('can parse a floating point number', function() {
    var fn = parse('4.2')
    expect(fn()).toBe(4.2)
  })

  it('can parse a floationg point number without interger part', function() {
    var fn = parse('.42')
    expect(fn()).toBe(0.42)
  })

  //parsing scientific notation
  it('can parse a number in scientific notation', function() {
    var fn = parse('42e3')
    expect(fn()).toBe(42000)
  })

  it('can parse scientific notation with a float coefficient', function() {
    var fn = parse('.42e2')
    expect(fn()).toBe(42)
  })

  it('can parse scientific notation with negative exponents', function() {
    var fn = parse('4200e-2')
    expect(fn()).toBe(42)
  })

  it('can parse scientific notation with the + sign', function() {
    var fn = parse('.42e+2')
    expect(fn()).toBe(42)
  })

  //will not parse invalid scientific notation
  it('will not parse invalid scientific notation', function() {
    expect(function() { parse('42e-') }).toThrow()
    expect(function() { parse('42e-a') }).toThrow()
  })

  //parsing strings
  it('can parse a string in single quotes', function() {
    var fn = parse("'abc'")
    expect(fn()).toEqual('abc')
  })

  it('can parse a string in double quotes', function() {
    var fn = parse('"abc"')
    expect(fn()).toEqual('abc')
  })

  it('will not parse a string with mismatching qutoes', function() {
    expect(function() { parse('"abc\'') }).toThrow()
  })

  it('marks strings as literal and constant', function() {
    var fn = parse('"abc"')
    expect(fn.literal).toBe(true)
    expect(fn.constant).toBe(true)
  })

  it('will parse a string with character escapes', function() {
    var fn = parse('"\\n\\r\\\\"')
    expect(fn()).toEqual('\n\r\\')
  })

  //consider about unicode escapes
  it('will parse a string with unicode escapes', function() {
    var fn = parse('"\\u00A0"')
    expect(fn()).toEqual('\u00A0')
  })

  it('will not parse a string with invalid unicode escapes', function() {
    expect(function() { parse('"\\u00T0"'); }).toThrow
  })

  //parsing true, false, and null
  it('will parse null', function() {
    var fn = parse('null')
    expect(fn()).toBe(null)
  })

  it('will parse true', function() {
    var fn = parse('true')
    expect(fn()).toBe(true)
  })

  it('will parse false', function() {
    var fn = parse('false')
    expect(fn()).toBe(false)
  })

  //true, false and null are liteal and constant tokens
  it('marks boolean as literal and constant', function() {
    var fn = parse('true')
    expect(fn.literal).toBe(true)
    expect(fn.constant).toBe(true)
  })

  it('marks null as literal and constant', function() {
    var fn = parse('null')
    expect(fn.literal).toBe(true)
    expect(fn.constant).toBe(true)
  })

  //parsing whitespace
  it('ignores whitespace', function() {
    var fn = parse('\n42')
    expect(fn()).toEqual(42)
  })

  //parsing arrays
  it('will parse an empty array', function() {
    var fn = parse('[]')
    expect(fn()).toEqual([])
  })

  it('will parse a non-empty array', function() {
    var fn = parse('[1, "two", [3]]')
    expect(fn()).toEqual([1, 'two', [3]])
  })

  it('will parse an array with trailing commas', function() {
    var fn = parse('[1, 2, 3, ]')
    expect(fn()).toEqual([1, 2, 3])
  })

  it('marks array literals as literal and constant', function() {
    var fn = parse('[1, 2, 3]')
    expect(fn.literal).toBe(true)
    expect(fn.constant).toBe(true)
  })

  //parsing objects
  it('will parse an empty object', function() {
    var fn = parse('{}')
    expect(fn()).toEqual({})
  })

  it('will parse a non-empty object', function() {
    var fn = parse('{a: 1, b: [2, 3], c: {d: 4}}')
    expect(fn()).toEqual({a: 1, b: [2, 3], c: {d: 4}})
  })

  it('will parse an object with string keys', function() {
    var fn = parse('{"a key": 1, \'another-key\': 2}')
    expect(fn()).toEqual({'a key': 1, 'another-key': 2})
  })
})
