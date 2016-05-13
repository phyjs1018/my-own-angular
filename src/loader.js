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
//defined a method which is used to match function args
const FN_ARGS = /^function\s*[^(]*\(\s*([^\(]*)\)/m
//delete whileSpace in arguments
const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/
//replace comments in function args
const STRIP_COMMENTS = /(\/\/.*$)|(\/\*.*?\*\/)/mg

const createInjector = (modulesToLoad, strictDi) => {
  let cache = {}
  let loadModules = {}
  //ensure strictDi was a boolean, if not this expression would translate it
  strictDi = (strictDi === true)
  let $provide = {
    constant(key, value) {
      if (key === 'hasOwnProperty') {
        throw 'hasOwnProperty is not a valid constant name'
      }
      cache[key] = value
    }
  }

  function invoke(fn, self = null, locals) {
    let args = _.map(annotate(fn), (token) => {
      if (_.isString(token)) {
        return locals && locals.hasOwnProperty(token) ? locals[token] : cache[token]
      } else {
        throw 'Incorrect injection token! Expected a string, got ' + token;
      }
    })
    if (_.isArray(fn)) {
      fn = _.last(fn)
    }
    return fn.apply(self, args)
  }

  function annotate(fn) {
    if (_.isArray(fn)) {
      return fn.slice(0, fn.length - 1)
    } else if (fn.$inject) {
      return fn.$inject
    } else if (!fn.length) {
      return []
    } else {
      if (strictDi) {
        throw `fn is not using explicit annotation and
               cannot be invoked in strict mode` 
      }
      let source = fn.toString().replace(STRIP_COMMENTS, '')
      let argDeclaration = source.match(FN_ARGS)
      return _.map(argDeclaration[1].split(','), (argName) => {
        return argName.match(FN_ARG)[2]
      })
    }
  }
  
  function instantiate(Type, locals) {
    let UnwrappedType = _.isArray(Type) ? _.last(Type) : Type
    let instance = Object.create(UnwrappedType.prototype)
    invoke(Type, instance, locals)
    return instance
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
    annotate,
    instantiate
  }
}
