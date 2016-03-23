//$apply $eval
class Scope {
    constructor() {
        this.$$watchers = []
        this.$$lastDirtyWatch = null
    }
    
    $watch(watcherFn, listenerFn, valueEq) {
        let watcher = {
            'watchFn': watcherFn,
            'listenFn': listenerFn,
            'valueEq': !!valueEq,
            'last': initWatchValue
        }
        this.$$watchers.push(watcher)
        this.$$lastDirtyWatch = null
    }
    
    $$areEqual(newValue, oldValue, valueEq) {
       if(valueEq) {
           return _.isEqual(newValue, oldValue)
       } else {
           return newValue === oldValue || (typeof newValue === 'number' && typeof oldValue === 'number' && isNaN(newValue) && isNaN(oldValue))
       }
    }
    
    $digestOnce() {
        let self = this
        let newValue, oldValue, dirty
        _.forEach(this.$$watchers, (watcher) => {
            newValue= watcher.watchFn(self)
            oldValue = watcher.last
            valueEq = watcher.valueEq
            if(!self.$$areEqual(newValue, oldValue, watcher.valueEq)){
                self.$$lastDirtyWatch = watcher
                watcher.last = (valueEq ? _.cloneDeep(newValue) : newValue)
                watcher.listenFn(newValue,
                                 (oldValue === initWatchValue ? newValue : oldValue),
                                 self)
                dirty = true
            } else if(self.$$lastDirtyWatch == watcher){
                return false
            }
        })
        return dirty
    }
    
    $digest() {
        let ttl = 10
        let dirty
        do{
            dirty = this.$digestOnce()
            while(dirty && !(ttl--)){
                throw '10 digest iteration reached'
            }
        }while(dirty)
    }
    
    $eval(expr, locals) {
        return expr(this, locals)
    }
    
    $apply(expr) {
        try {
            this.$eval(expr)
        } finally {
            this.$digest
        }
    }
}