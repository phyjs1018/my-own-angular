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
})
