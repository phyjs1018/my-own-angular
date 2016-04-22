class Scope {
	constructor() {
		this.$$watchers = []
		this.initWatchVal = () => {}
	}

	$watch(watchFn, listenerFn) {
		let watcher = {
			watchFn: watchFn,
			listenerFn: listenerFn || function() {},
			last: this.initWatchVal
		}
		this.$$watchers.push(watcher)
	}
	
	$digest() {
		let ttl = 10
		let dirty
		do {
			dirty = this.$digestOnce()
			
			if(dirty && !(ttl--)) {
				throw "10 digest iteration reached"
			}
		} while (dirty)
	}

	$digestOnce() {
		let self = this
		let newValue, oldValue, dirty
		_.forEach(self.$$watchers, (watcher) => {
			newValue = watcher.watchFn(self)
			oldValue = watcher.last
			if(newValue !== oldValue) {
				watcher.last = newValue
				watcher.listenerFn(newValue, 
					//we'd rather not leak that function outside of scope.js
						(oldValue === self.initWatchVal ? newValue : oldValue), 
							self)
				dirty = true
			}
		})
		return dirty
	}
}