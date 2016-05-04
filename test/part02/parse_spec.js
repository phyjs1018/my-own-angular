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
})
