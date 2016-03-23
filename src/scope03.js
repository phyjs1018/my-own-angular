//check the dirty value
function Scope() {
    this.$$watchers = []
    this.$$lastDirtyWatch = null
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
    var watcher = {
        'watchFn': watchFn,
        'listenerFn': listenerFn,
        'last': initWatchVal
    }
    
    this.$$watchers.push(watcher)
    this.$$lastDirtyWatch = null
}

Scope.prototype.$digestOne = function() {
    var self = this
    var newValue, oldValue, dirty
    _.forEach(this.$$watchers, function(watcher){
        newValue = watcher.watchFn(self)
        oldValue = watcher.last
        if(newValue !== oldValue){
            self.$$lastDirtyWatch = watcher
            watcher.last = newValue
            watcher.listenerFn(newValue,
                               (oldValue === initWatchVal ? newValue : oldValue),
                               self)
            dirty = true
          
        }else if(this.$$lastDirtyWatch === watch){
            return false
        }
    })
    return dirty
}


Scope.prototype.$digest = function() {
    var ttl = 10
    do{
        dirty = this.$digestOne
        while(dirty && !(ttl--)){
            throw "10 digest iteration reached"
        }
    }while(dirty)
}