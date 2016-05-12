describe('setupModuleLoader', function() {
  //Initializing the global just once
  beforeEach(function() {
    delete window.angular
  })

  it('exposes angular on the window', function() {
    setupModuleLoader(window)
    expect(window.angular).toBeDefined()
  })

  it('creates angular just once', function() {
    setupModuleLoader(window)
    var ng = window.angular
    setupModuleLoader(window)
    expect(window.angular).toBe(ng)
  })

  //the module method
  it('exposes the angular module function', function() {
    setupModuleLoader(window)
    expect(window.angular.module).toBeDefined()
  })

  it('exposes the angular module function just once', function() {
    setupModuleLoader(window)
    var module = window.angular.module
    setupModuleLoader(window)
    expect(window.angular.module).toBe(module)
  })

//module
  describe('module', function() {
    beforeEach(function() {
      setupModuleLoader(window)
    })

    //registering a module
    it('allow registering a module', function() {
      var myModule = window.angular.module('myModule', [])
      expect(myModule).toBeDefined()
      expect(myModule.name).toEqual('myModule')
    })

    it('replaces a module when registering with same name again', function() {
      var myModule = window.angular.module('myModule', [])
      var myNewModule = window.angular.module('myModule', [])
      expect(myNewModule).not.toBe(myModule)
    })

    it('attaches the requires array to the registering module', function() {
      var myModule = window.angular.module('myModule', ['myOtherModule'])
      expect(myModule.requires).toEqual(['myOtherModule'])
    })

    //get a registered module
    it('allows getting a module', function() {
      var myModule = window.angular.module('myModule', [])
      var gotModule = window.angular.module('myModule')

      expect(gotModule).toBeDefined()
      expect(gotModule).toBe(myModule)
    })

    it('throws when trying to get a nonexistent module', function() {
      expect(function() {
        window.angular.module('myModule')
      }).toThrow()
    })
  })

  //the injector
  describe('injector', function() {
    beforeEach(function() {
      delete window.angular
      setupModuleLoader(window)
    })

    it('can be created', function() {
      var injector = createInjector([])
      expect(injector).toBeDefined()
    })

    // registering a constant
    it('has a constant that has been registered to a module', function() {
      var module = angular.module('myModule', [])
      module.constant('aConstant', 42)
      var Injector = createInjector(['myModule'])
      expect(Injector.has('aConstant')).toBe(true)
    })

    it('does not have a non-registered constant', function() {
      var module = angular.module('myModule', [])
      var injector = createInjector(['myModule'])
      expect(injector.has('aConstant')).toBe(false)
    })

    it('does not allow a constant called hasOwnProperty', function() {
      var module = angular.module('myModule', [])
      module.constant('hasOwnProperty', _.constant(false))
      expect(function() {
        createInjector(['myModule'])
      }).toThrow()
    })

    it('can return a registered constant', function() {
      var module = angular.module('myModule', [])
      module.constant('aConstant', 42)
      var injector = createInjector(['myModule'])
      expect(injector.get('aConstant')).toBe(42)
    })

    //requiring other modules
    it('loads multiple modules', function() {
      var module1 = angular.module('myModule', [])
      var module2 = angular.module('myOtherModule', [])
      module1.constant('aConstant', 42)
      module2.constant('anotherConstant', 43)
      var injector = createInjector(['myModule', 'myOtherModule'])

      expect(injector.has('aConstant')).toBe(true)
      expect(injector.has('anotherConstant')).toBe(true)
    })

    it('loads the transitively required modules of a module', function() {
      var module1 = angular.module('myModule', [])
      var module2 = angular.module('myOtherModule', ['myModule'])
      var module3 = angular.module('myThirdModule', ['myOtherModule'])
      module1.constant('aConstant', 42)
      module2.constant('anotherConstant', 43)
      module3.constant('aThirdConstant', 44)
      var injector = createInjector(['myThirdModule'])

      expect(injector.has('aConstant')).toBe(true)
      expect(injector.has('anotherConstant')).toBe(true)
      expect(injector.has('aThirdConstant')).toBe(true)
    })

    it('loads each module only once', function() {
      var module1 = angular.module('myModule', ['myOtherModule'])
      var module2 = angular.module('myOtherModule', ['myModule'])

      createInjector(['myModule'])
    })

    //dependency injection
    it('invokes an annotated function with dependency injection', function() {
      var module = angular.module('myModule', [])
      module.constant('a', 1)
      module.constant('b', 2)
      var injector = createInjector(['myModule'])

      var fn = function(one, two) {
        return one + two
      }
      fn.$inject = ['a', 'b']

      expect(injector.invoke(fn)).toBe(3)
    })

    //rejecting non-string DI tokens
    it('does not accept non-strings as injection tokens', function() {
      var module = angular.module('myModule', [])
      module.constant('a', 1)
      var injector = createInjector(['myModule'])

      var fn = function(one, two) { return one + two }
      fn.$inject = ['a', 2]

      expect(function() {
        injector.invoke(fn)
      }).toThrow()
    })

    //binding this injected functions
    it('invokes a function with the given this context', function() {
      var module = angular.module('myModule', [])
      module.constant('a', 1)
      var injector = createInjector(['myModule'])

      var obj = {
        two: 2,
        fn: function(one) {
          return one + this.two
        }
      }
      obj.fn.$inject = ['a']

      expect(injector.invoke(obj.fn, obj)).toBe(3)
    })

    //providing locals to injected functions
    it('overrides dependencies with locals when invoking', function() {
      var module = angular.module('myModule', [])
      module.constant('a', 1)
      module.constant('b', 2)
      var injector = createInjector(['myModule'])

      var fn = function(one, two) {
        return one + two
      }
      fn.$inject = ['a', 'b']

      expect(injector.invoke(fn, undefined, {b: 3})).toBe(4)
    })

     //array-style dependency annotation
    describe('annotate', function() {
      it('returns the $inject annotate of a function when it has one', function() {
        var injector = createInjector([])

        var fn = function() { }
        fn.$inject = ['a', 'b']

        expect(injector.annotate(fn)).toEqual(['a', 'b'])
      })

      it('returns the array-style annotations of a function', function() {
        var injector = createInjector([])
        var fn = ['a', 'b', function() { }]

        expect(injector.annotate(fn)).toEqual(['a', 'b'])
      })
    })
  })
})
