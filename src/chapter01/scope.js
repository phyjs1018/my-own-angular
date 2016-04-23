class Scope {
	constructor() {
		this.$$watchers = []
		this.initWatchVal = () => {}
		this.$$lastDirtyWatch = null
	}

	$watch(watchFn, listenerFn) {
		let watcher = {
			watchFn: watchFn,
			listenerFn: listenerFn || function() {},
			last: this.initWatchVal
		}
		this.$$watchers.push(watcher)
		//does not end the digest so that the new watches are not run
		this.lastDirtyWatch = null
	}
	
	$digest() {
		let ttl = 10
		let dirty
		this.lastDirtyWatch = null
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
				self.lastDirtyWatch = watcher
				watcher.last = newValue
				watcher.listenerFn(newValue, 
					//we'd rather not leak that function outside of scope.js
						(oldValue === self.initWatchVal ? newValue : oldValue), 
							self)
				dirty = true
			} else if (self.lastDirtyWatch === watcher) {
				//short-circuiting the digest when the last watch is clean
				return false
			}
		})
		return dirty
	}
}