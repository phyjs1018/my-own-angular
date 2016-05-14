describe('provide', function() {
  beforeEach(function() {
    delete window.angular
    setupModuleLoader(window)
  })
  
  it('allows registering a provider and uses its $get', function() {
    var module = angular.module('myModule', [])
    module.provider('a', {
      $get: function() {
        return 42
      }
    })
    
    var injector = createInjector(['myModule'])
    
    expect(injector.has('a')).toBe(true)
    expect(injector.get('a')).toBe(42)
  })
  
  //injecting Dependencies to the $digest method
  it('injects the $get method of a provider', function() {
    var module = angular.module('myModule', [])
    module.constant('a', 1)
    module.provider('b', {
      $get: function(a) {
        return a + 2
      }
    })
    
    var injector = createInjector(['myModule'])
    expect(injector.get('b')).toBe(3)
  })
  
  //lazy instantiation of dependencies
  it('injects the $get method of a provider lazily', function() {
    var module = angular.module('myModule', [])
    module.provider('b', {
      $get: function(a) {
        return a + 2
      }
    })
    module.provider('a', {$get: _.constant(1)})
    
    var injector = createInjector(['myModule'])
    
    expect(injector.get('b')).toBe(3)
  })
  
  //making sure everything is a singleton
  it('instantiates a dependency only once', function() {
    var module = angular.module('myModule', [])
    module.provider('a', {$get: function() { return {} }})
    
    var injector = createInjector(['myModule'])
    
    //when we get, it will called invoke and each time it will return a new object
    expect(injector.get('a')).toBe(injector.get('a'))
  })
  
  //circular dependencies
  it('notifies the user about a circular dependency', function() {
    var module = angular.module('myModule', [])
    module.provider('a', {$get: function(b) { }})
    module.provider('b', {$get: function(c) { }})
    module.provider('c', {$get: function(a) { }})
    
    var injector = createInjector(['myModule'])
    
    expect(function() {
      injector.get('a')
    }).toThrowError(/Circular dependency found/)
  })
  
  it('cleans up the circular marker when instantiation fails', function() {
    var module = angular.module('myModule', [])
    module.provider('a', {$get: function() {
      throw 'Failing instantiation! '
    }})
    
    var injector = createInjector(['myModule'])
    
    expect(function() {
      injector.get('a')
    }).toThrow('Failing instantiation! ')
    
    expect(function() {
      injector.get('a')
    }).toThrow('Failing instantiation! ')
  })
  
  it('notifies the user about a circular dependency', function() {
    var module = angular.module('myModule', [])
    module.provider('a', {$get: function(b) { }})
    module.provider('b', {$get: function(c) { }})
    module.provider('c', {$get: function(a) { }})
    
    var injector = createInjector(['myModule'])
    
    expect(function() {
      injector.get('a')
    }).toThrowError('Circular dependency found: a <- c <- b <- a')
  })
  
  //provider constructors
  it('instantiates a provider if given as a constructor function', function() {
    var module = angular.module('myModule', [])
    
    module.provider('a', function Aprovider() {
      this.$get = function() { return 42 }
    })
    
    var injector = createInjector(['myModule'])
    
    expect(injector.get('a')).toBe(42)
  })
  
  it('injects the given provider constructor function', function() {
    var module = angular.module('myModule', [])
    
    module.constant('b', 2)
    module.provider('a', function Aprovider() {
      this.$get = function(b) { return 1 + b }
    })
    
    var injector = createInjector(['myModule'])
    
    expect(injector.get('a')).toBe(3)
  })
  
  it('injects another provider to a provider constructor function', function() {
    var module = angular.module('myModule', [])
    
    module.provider('a', function Aprovider() {
      var value = 1
      this.setValue = function(v) { value = v }
      this.$get = function() { return value }
    })
    module.provider('b', function Bprovider(aProvider) {
      aProvider.setValue(2)
      this.$get = function() { }
    })
    
    var injector = createInjector(['myModule'])
    
    expect(injector.get('a')).toBe(2)
  })
  
  it('does not inject an instance to a provide constructor function', function() {
    var module = angular.module('myModule', [])
    
    module.provider('a', function AProvider() {
      this.$get = function() { return 1 }
    })
    
    module.provider('b', function BProvider(a) {
      this.$get = function() { return a }
    })
    
    expect(function() {
      createInjector(['myModule'])
    }).toThrow()
  })
  
  it('does not inject a provider to a $get function', function() {
    var module = angular.module('myModule', [])
    
    module.provider('a', function AProvider() {
      this.$get = function() { return 1 }
    })
    
    module.provider('b', function BProvider() {
      this.$get = function(aProvider) { return aProvider.$get() }
    })
    
    var injector = createInjector(['myModule'])
    
    expect(function() {
      injector.get('b')
    }).toThrow()
  })
})