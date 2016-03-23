//scope phase
class Scope {
    constructor() {
        this.$$watchers = []
        this.$$lastDirtyWatch = null
        this.$$asyncQueue = []
        this.$$phase = null
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
        this.$$lastDirtyWatch = null
        this.$beginPhase('$digest')
        do{
            while(this.$$asyncQueue.length) {
                let asyncTask = this.$$asyncQueue.shift()
                asyncTask.scope.$eval(asyncTask.expression)
            }
            dirty = this.$digestOnce()
            while(dirty ||this.$$asyncQueue.length && !(ttl--)){
                throw '10 digest iteration reached'
            }
        }while(dirty || this.$$asyncQueue.length)
        
        this.$cleanPhase()
    }
    
    $eval(expr, locals) {
        return expr(this, locals)
    }
    
    $apply(expr) {
        try {
            this.$beginPhase('$apply')
            this.$eval(expr)
        } finally {
            this.$cleanPhase()
            this.$digest
        }
    }
    
    $evalAsync(expr) {
        let self = this
        if(!self.$$phase && !self.$$asyncQueue.length) {
            setTimeout(() => {
                if(self.$$asyncQueue.length){
                    self.$digest
                }
            }, 0)
        }
        this.$$asyncQueue.push({scope: this, expression: expr})
    }
    
    $beginPhase(phase) {
        if(this.$$phase) {
            throw this.$$phase + 'already in process'
        }
        this.$$phase = phase
    }
    
    $cleanPhase() {
        this.$$phase = null
    }
}