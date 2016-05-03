describe('parse', function() {
  it('can parse an interger', function() {
    var fn = parse('42')
    expect(fn).toBeDefined()
    expect(fn()).toBe(42)
  })

  //making literals and constants
  it('makes intergers both constant and literal', function() {
    var fn = parse('42')
    expect(fn.constant).toBe(true)
    expect(fn.literal).toBe(true)
  })
})
