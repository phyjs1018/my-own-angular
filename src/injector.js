//Injector
//defined a method which is used to match function args
const FN_ARGS = /^function\s*[^(]*\(\s*([^\(]*)\)/m

//delete whileSpace in arguments
const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/

//replace comments in function args
const STRIP_COMMENTS = /(\/\/.*$)|(\/\*.*?\*\/)/mg

//Circular dependency found
const INSTANTIATING = {}

const createInjector = (modulesToLoad, strictDi) => {
  let providerCache = {}
  let providerInjector = createInternalInjector(providerCache, () => {
    throw 'Unknow provider: ' + path.join(' <- ')
  })
  let instanceCache = {}
  let instanceInjector = createInternalInjector(instanceCache, (name) => {
    let provider = providerInjector.get(name + 'Provider')
    return instanceInjector.invoke(provider.$get, provider)
  })
  let loadedModules = {}
  let path = []
  strictDi = (strictDi === true)
  
  let $provide = {
    constant(key, value) {
      if (key === 'hasOwnProperty') {
        throw 'hasOwnProperty is not a valid constant name! '
      }
      providerCache[key] = value
      instanceCache[key] = value
    },
    provider(key, provider) {
      if (_.isFunction(provider)) {
        provider = providerInjector.instantiate(provider)
      }
      providerCache[key + 'Provider'] = provider
    }
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
        throw 'fn is not using explicit annotation and cannot be invoked in strict mode'
      }
      let source = fn.toString().replace(STRIP_COMMENTS, '')
      let argDeclaration = source.match(FN_ARGS)
      return _.map(argDeclaration[1].split(','), (argName) => {
        return argName.match(FN_ARG)[2]
      })
    }
  }
  
  function createInternalInjector(cache, factoryFn) {
    function getService(name) {
      if (cache.hasOwnProperty(name)) {
        if (cache[name] === INSTANTIATING) {
          throw new Error('Circular dependency found: ' + name + ' <- ' + path.join(' <- '))
        }
        return cache[name]
      } else {
        path.unshift(name)
        cache[name] = INSTANTIATING
        try {
          return (cache[name] = factoryFn(name))
        } finally {
          path.shift()
          if (cache[name] === INSTANTIATING) {
            delete cache[name]
          }
        }
      }
    }
    
    function invoke(fn, self = null, locals) {
      let args = _.map(annotate(fn), (token) => {
        if (_.isString(token)) {
          return locals && locals.hasOwnProperty(token) ? locals[token] : getService(token)
        } else {
          throw 'Incorrect injection token! Expected a string, got ' + token
        }
      })
      if (_.isArray(fn)) {
        fn = _.last(fn)
      }
      return fn.apply(self, args)
    }
    
    function instantiate(Type, locals) {
      let UnwrappedType = _.isArray(Type) ? _.last(Type) : Type
      let instance = Object.create(UnwrappedType.prototype)
      invoke(Type, instance, locals)
      return instance
    }
    
    return {
      has(name) {
        return cache.hasOwnProperty(name) || providerCache.hasOwnProperty(name + 'Provider')
      },
      get: getService,
      annotate,
      invoke,
      instantiate
    }
  }
  
  _.forEach(modulesToLoad, function loadModule(moduleName) {
    if (!loadedModules.hasOwnProperty(moduleName)) {
      loadedModules[moduleName] = true
      let module = angular.module(moduleName)
      _.forEach(module.requires, loadModule)
      _.forEach(module._invokeQueue, (invokeArgs) => {
        let method = invokeArgs[0]
        let args = invokeArgs[1]
        $provide[method].apply($provide, args)
      })
    }
  })
  
  return instanceInjector  
}