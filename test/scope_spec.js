xdescribe('scope', function() {
  it('can be constructed used as an object', function() {
    var scope = new Scope()
    scope.aProperty = 1
    
    expect(scope.aProperty).toBe(1)
  })

  describe('digest', function() {
  	var scope

  	beforeEach(function() {
  		scope = new Scope()
  	})

  	it('calls the listener function when the watched value changes', function() {
  		var watchFn = jasmine.createSpy()
  		var listenerFn = function() { }
  		scope.$watch(watchFn, listenerFn)

  		scope.$digest()

  		expect(watchFn).toHaveBeenCalledWith(scope)
  	})

  	it('calls listener when watch value is first undefined', function() {
  		scope.counter = 0

  		scope.$watch(
  			function(scope) {return scope.someValue},
  			function(newValue, oldValue, scope) {scope.counter++}
  		)

  		scope.$digest()
  		expect(scope.counter).toBe(1)
  	})

  	it('calls listener with new value as old value the first time', function() {
  		scope.someValue = 123
  		var oldValueGiven

  		scope.$watch(function(scope) {
  			return scope.someValue
  		},function(newValue, oldValue, scope) {
  			oldValueGiven = oldValue
  		})

  		scope.$digest()
  		expect(oldValueGiven).toBe(123)
  	})
  })
})