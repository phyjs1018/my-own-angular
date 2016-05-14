const setupModuleLoader = (window) => {
  const ensure = (obj, name, factory) => {
    return obj[name] || (obj[name] = factory())
  }

  let angular = ensure(window, 'angular', Object)

//Module
//helper methods to create or get module
  const createModule = (name, requires, modules) => {
    if (name === 'hasOwnProperty') {
      throw 'hasOwnProperty is not a valid module name'
    }
    let invokeQueue = []
    
    const invokeLater = (method, arrayMethod) => {
      return function() {
        invokeQueue[arrayMethod || 'push']([method, arguments])
        //chain
        return moduleInstance
      }
    }
    let moduleInstance = {
      name,
      requires,
      constant: invokeLater('constant', 'unshift'),
      provider: invokeLater('provider'),
      _invokeQueue: invokeQueue
    }
    modules[name] = moduleInstance
    return moduleInstance
  }

  const getModule = (name, modules) => {
    if (modules.hasOwnProperty(name)) {
      return modules[name]
    } else {
      throw 'Module' + name + 'is not available'
    }
  }

//primary method
  ensure(angular, 'module', function() {
    let modules = {}
    return function(name, requires) {
      if (requires) {
        return createModule(name, requires, modules)
      } else {
        return getModule(name, modules)
      }
    }
  })
}


