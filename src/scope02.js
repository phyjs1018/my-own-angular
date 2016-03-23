function Scope() {
    this.$$watchers = []  //double-dollar signified that this variable should be considered private to the angular framework
    
    }
    
    
function initWatchVal() {    
}
    
Scope.prototype.$watch = function(watchFn, listenerFn) {
    var watcher = {
        'watchFn': watchFn,
        'listenerFn': listenerFn,
        'last': initWatchVal
    }
    this.$$watchers.push(watcher)
}

Scope.prototype.$digest = function() {
    var self = this
    var newValue, oldValue
    
    _.forEach(this.$$watchers, function(watcher) {
        newValue = watcher.watchFn(self)
        oldValue = watcher.last
        if(newValue !== oldValue) {
            watcher.last = newValue
            watcher.listenerFn(newValue, 
            (oldValue === initWatchVal ? newValue : oldValue), 
            self)
        }
    })
}