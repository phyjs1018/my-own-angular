Modules and The injector

module
- How the angular global variable and its modules method come to be
- How modules can be registered
- The angular global will only ever be registered once per window ,but any given module can be overriden by a later registration with the same name
- How previously registered modules can be looked up
- How a injector comes to be
- How the injector is given name of modules to instantiate, which it will look up from the angular global

injector
- How provider objects and their $get methods work, and how their dependencies are injected using injector.invoke
- How the module loader API allows chaining of registration methods calls by returning the module instance
- That $get methods are called lazily, only when someone needs the dependency
- How all dependencies are singletons because $get methods are called at most once and their results are then cached
- How circular dependencies are handle and circular dependency error messages constructed
- How provider can be registered as plain objects or constructor functions
- How provider constructor function are instantiated using dependency injection
- How the two phases of dependency injection are separated inside the injector by having two dependency caches and two interal inject objects
- How the instance injector falls back to the provider injection on cache misses
- How constant are always registered first to loosen up the requirement in registration order