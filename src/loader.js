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
    let moduleInstance = {
      name: name,
      requires: requires,
      constant(key, value) {
        invokeQueue.push(['constant', [key, value]])
      },
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

//Injector
const createInjector = (modulesToLoad) => {
  let cache = {}
  let loadModules = {}
  let $provide = {
    constant(key, value) {
      if (key === 'hasOwnProperty') {
        throw 'hasOwnProperty is not a valid constant name'
      }
      cache[key] = value
    }
  }

  function invoke(fn, self, locals) {
    let args = _.map(fn.$inject, (token) => {
      if (_.isString(token)) {
        return locals && locals.hasOwnProperty(token) ? locals[token] : cache[token]
      } else {
        throw 'Incorrect injection token! Expected a string, got ' + token;
      }
    })
    return fn.apply(self, args)
  }

  function annotate(fn) {
    if (_.isArray(fn)) {
      return fn.slice(0, fn.length - 1)
    } else {
      return fn.$inject
    }
  }

  _.forEach(modulesToLoad, function loadModule(moduleName) {
    if (!loadModules.hasOwnProperty(moduleName)) {
      loadModules[moduleName] = true
      let module = angular.module(moduleName)
      _.forEach(module.requires, loadModule)
      _.forEach(module._invokeQueue, (invokeArgs) => {
        let method = invokeArgs[0]
        let args = invokeArgs[1]
        $provide[method].apply($provide, args)
      })
    }
  })
  return {
    has(key) {
      return cache.hasOwnProperty(key)
    },
    get(key) {
      return cache[key]
    },
    invoke,
    annotate
  }
}
