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
})