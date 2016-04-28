describe('scope', function() {
  it('can be constructed used as an object', function() {
    var scope = new Scope()
    scope.aProperty = 1

    expect(scope.aProperty).toBe(1)
  })

//scope dirty-checking
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

		it('compare based on value if enabled', function() {
			scope.aValue = [1, 2, 3]
			scope.count = 0

			scope.$watch(
				function(scope) {
					return scope.aValue
				}, function(newValue, oldValue, scope) {
					scope.count++
				},
				true)

			scope.$digest()
			expect(scope.count).toBe(1)

			scope.aValue.push(4)
			scope.$digest()
			expect(scope.count).toBe(2)
		})

		it('correctly handles NaNs', function() {
			scope.number = 0/0
			scope.counter = 0

			scope.$watch(
				function(scope) {return scope.number},
				function(newValue, oldValue, scope) {
					scope.counter++
				})

			scope.$digest()
			expect(scope.counter).toBe(1)

			scope.$digest()
			expect(scope.counter).toBe(1)
		})

		it('executes $eval ed function and returns result', function() {
			scope.aValue = 42

			var result = scope.$eval(function(scope) {
				return scope.aValue
			})

			expect(result).toBe(42)
		})

		it('passes the second $eval arguments straight through', function() {
			scope.aValue = 42

			var result = scope.$eval(function(scope, arg) {
				return scope.aValue + arg
			}, 2)

			expect(result).toBe(44)
		})

		it('executes $apply ed function and starts the digest', function() {
			scope.aValue = 'someValue'
			scope.counter = 0

			scope.$watch(
				function(scope) {return scope.aValue},
				function(newValue, oldValue, scope) {
					scope.counter++
				})

			scope.$digest()
			expect(scope.counter).toBe(1)

			scope.$apply(function(scope) {
				scope.aValue = 'someOtherValue'
			})
			expect(scope.counter).toBe(2)
		})

		it('executes $evalAsync function later in the same cycle', function() {
			scope.aValue = [1, 2, 3]
			scope.asyncEvaluated = false
			scope.asyncEvaluatedImmediately = false

			scope.$watch(
				function(scope) {return scope.aValue},
				function(newValue, oldValue, scope) {
					scope.$evalAsync(function(scope) {
						scope.asyncEvaluated = true
					})
				  	scope.asyncEvaluatedImmediately = scope.asyncEvaluated
				}
			)

			scope.$digest()
			expect(scope.asyncEvaluated).toBe(true)
			expect(scope.asyncEvaluatedImmediately).toBe(false)
		})

		it('executes $evalAsync functions even when not dirty', function() {
			scope.aValue = [1, 2, 3]
			scope.asyncEvaluatedTimes = 0

			scope.$watch(
				function(scope) {
					if(scope.asyncEvaluatedTimes < 2) {
						scope.$evalAsync(function() {
							scope.asyncEvaluatedTimes++
						})
					}
					return scope.aValue
				},
				function(newValue, oldValue, scope) {}
			)

			scope.$digest()

			expect(scope.asyncEvaluatedTimes).toBe(2)
		})

		it('eventually hats $evalAsyncs added by watches', function() {
			scope.aValue = [1, 2, 3]

			scope.$watch(
				function(scope) {
					scope.$evalAsync(function(scope) {})
					return scope.aValue
				},
				function(newValue, oldValue, scope) {}
			)

			expect((function() {scope.$digest()})).toThrow()
		})

		it('has a $$Phase field whose value is current digest phase', function() {
			scope.aValue = [1, 2, 3]
			scope.phaseInWatchFunction = undefined
			scope.phaseInListenerFunction = undefined
			scope.phaseInApplyFunction = undefined

			scope.$watch(
				function(scope) {
					scope.phaseInWatchFunction = scope.$$phase
					return scope.aValue
				},
				function(newValue, oldValue, scope) {
					scope.phaseInListenerFunction = scope.$$phase
				}
			)

			scope.$apply(function(scope) {
				scope.phaseInApplyFunction = scope.$$phase
			})

			expect(scope.phaseInWatchFunction).toBe('$digest')
			expect(scope.phaseInListenerFunction).toBe('$digest')
			expect(scope.phaseInApplyFunction).toBe('$apply')
		})

		it('schedules a digest in $evalAsync', function(done) {
			scope.aValue = 'abc'
			scope.counter = 0

			scope.$watch(
				function(scope) {return scope.aValue},
				function(newValue, oldValue, scope) {
					scope.counter++
				}
			)

			scope.$evalAsync(function(scope) {})

			expect(scope.counter).toBe(0)
			setTimeout(function() {
				expect(scope.counter).toBe(1)
        done()
			}, 50)
		})

		it('allows async $apply with $applyAsync', function(done) {
			scope.counter = 0

			scope.$watch(
				function(scope) {return scope.aValue},
				function(newValue, oldValue,scope) {
					scope.counter++
				}
			)

			scope.$digest()
			expect(scope.counter).toBe(1)

			scope.$applyAsync(function(scope) {
				scope.counter++
			})
			expect(scope.counter).toBe(1)

			setTimeout(function() {
				expect(scope.counter).toBe(2)
        done()
			}, 50)
		})

		it('never executes $applyAsync ed function in the same cycle', function(done) {
			scope.aValue = [1, 2, 3]
			scope.asyncApplied = false

			scope.$watch(
        function(scope) {return scope.aValue},
        function(newValue, oldValue, scope) {
          scope.$applyAsync(function(scope) {
          	scope.asyncApplied = true
          })
        }
      )

      scope.$digest()
      expect(scope.asyncApplied).toBe(false)
      setTimeout(function() {
      	expect(scope.asyncApplied).toBe(true)
        done()
      }, 50)
		})

		it('coalesces many calls to $applyAsync', function(done) {
			scope.counter = 0

			scope.$watch(
				function(scope) {
					scope.counter++
					return scope.aValue
				},
				function(newValue, oldValue, scope) {}
			)

			scope.$applyAsync(function(scope) {
				scope.aValue = 'abc'
			})
			scope.$applyAsync(function(scope) {
				scope.aValue = 'def'
			})

			setTimeout(function() {
				expect(scope.counter).toBe(2)
        done()
			}, 50)
		})

    it('runs a $$postDigest function after each digest', function() {
      scope.counter = 0

      scope.$$postDigest(function() {
        scope.counter++
      })

      expect(scope.counter).toBe(0)

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('does not include $$postDigest in the digest', function() {
      scope.aValue = 'origin value'

      scope.$$postDigest(function() {
        scope.aValue = 'changed value'
      })

      scope.$watch(
        function(scope) { return scope.aValue },
        function(newValue, oldValue, scope) {
          scope.watchValue = newValue
        }
      )

      scope.$digest()
      expect(scope.watchValue).toBe('origin value')

      scope.$digest()
      expect(scope.watchValue).toBe('changed value')
    })

    it('allows destroying a $watch with a removal function', function() {
      scope.aValue = 'abc'
      scope.counter = 0

      var destroyWatch = scope.$watch(
        function(scope) { return scope.aValue },
        function(newValue, oldValue, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.aValue = 'def'
      scope.$digest()
      expect(scope.counter).toBe(2)

      scope.aValue = 'ghi'
      destroyWatch()
      scope.$digest()
      expect(scope.counter).toBe(2)
    })

    it('allows destroying a $watch during digest', function() {
      scope.aValue = 'abc'

      var watchCalls = []

      scope.$watch(
        function(scope) {
          watchCalls.push('first')
          return scope.aValue
        }
      )

      var destroyWatch = scope.$watch(
        function(scope) {
          watchCalls.push('second')
          destroyWatch()
        }
      )

      scope.$watch(
        function(scope) {
          watchCalls.push('third')
          return scope.aValue
        }
      )

      scope.$digest()
      expect(watchCalls).toEqual(['first', 'second', 'third', 'first', 'third'])
    })

    it('allows a $watch to destroy another during digest', function() {
      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function(scope) {
          return scope.aValue
        },
        function(newValue, oldvalue, scope) {
          destroyWatch()
        }
      )

      var destroyWatch = scope.$watch(
        function(scope) { },
        function(newValue, oldValue, scope) { }
      )

      scope.$watch(
        function(scope) {
          return scope.aValue
        },
        function(newValue, oldValue, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('allows destroying serveral $watches during digest', function() {
      scope.aValue = 'abc'
      scope.counter = 0

      var destroyWatch1 = scope.$watch(
        function(scope) {
          destroyWatch1()
          destroyWatch2()
        }
      )
      var destroyWatch2 = scope.$watch(
        function(scope) { return scope.aValue },
        function(newValue, oldValue, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(0)
    })

    describe('$watchGroup', function() {
      var scope
      beforeEach(function() {
        scope = new Scope()
      })

      it('takes watches as an array and calls listener with arrays', function() {
        var gotNewValues, gotOldValue

        scope.aValue = 1
        scope.anotherValue = 2

        scope.$watchGroup([
          function(scope) { return scope.aValue },
          function(scope) { return scope.anotherValue }
        ], function(newValue, oldvalue, scope) {
          gotNewValues = newValue
          gotOldValue = oldvalue
        })
        scope.$digest()

        expect(gotNewValues).toEqual([1, 2])
        expect(gotOldValue).toEqual([1, 2])
      })

      it('only calls listener once per digest', function() {
        var counter = 0

        scope.aValue = 1
        scope.anotherValue = 2

        scope.$watchGroup([
          function(scope) { return scope.aValue },
          function(scope) { return scope.anotherValue }
        ], function(newValues, oldValues, scope) {
          counter++
        })
        scope.$digest()

        expect(counter).toBe(1)
      })
    })
  })

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
      console.log(parent.$$children[0] === child)

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
  })
})
