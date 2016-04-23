describe('scope', function() {
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

    it('may have watchers that omit the listener function', function() {
      var watchFn = jasmine.createSpy().and.returnValue('something')

      scope.$watch(watchFn)
      scope.$digest()

      expect(watchFn).toHaveBeenCalled()
    })
		
		it('triggers chaine watchers in the same digest', function() {
			scope.name = 'jane'
			
			scope.$watch(
				function(scope) {return scope.nameUpper},
				function(newValue, oldValue, scope) {
					if(newValue) {
						scope.initial = newValue.substring(0, 1) + '.'
					}
				}
			)
			
			scope.$watch(
				function(scope) {return scope.name},
				function(newValue, oldValue, scope) {
					if(newValue) {
						scope.nameUpper = newValue.toUpperCase()
					}
				}
			)
			
			scope.$digest()
			expect(scope.initial).toBe('J.')
			
			scope.name = 'bob'
			scope.$digest()
			expect(scope.initial).toBe('B.')
		})
		
		it('gives up on the watches after 10 iterations', function() {
			scope.counterA = 0
			scope.counterB = 0
			
			scope.$watch(
				function(scope) {return scope.counterA},
				function(newValue, oldValue, scope) {
					scope.counterB++
				}
			)
			
			scope.$watch(
				function(scope) {return scope.counterB},
				function(newValue, oldValue, scope) {
					scope.counterA++
				}
			)
			
			//it will call that function for us, so that it can check that it throws an exception like we expect
			expect((function() { scope.$digest()})).toThrow()
		})

		it('ends the digest when the last watch is clean', function() {
			scope.array = _.range(100)
			//console.log(scope.array)
			var watchExecutions = 0

			_.times(100, function(i) {
				scope.$watch(
					function(scope) {
						watchExecutions++
						return scope.array[i]
					},
					function(newValue, oldValueGiven, scope) {

					}
				)
			})

			scope.$digest()
			expect(watchExecutions).toBe(200)

			scope.array[0] = 420
			scope.$digest()
			expect(watchExecutions).toBe(301)
		})

		it('does not end digest so that new watchers are not run', function() {
			scope.aValue = 'abc'
			scope.count = 0

			scope.$watch(
				function(scope) {
					return scope.aValue
				}, function(newValue, oldValue, scope) {
					scope.$watch(
						function(scope) {
							return scope.aValue
						}, function(newValue, oldValue, scope) {
							scope.count++
						})
				})
			scope.$digest()

			expect(scope.count).toBe(1)
		})
  })
})