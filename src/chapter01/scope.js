class Scope {
	constructor() {
		this.$$watchers = []
		this.initWatchVal = () => {}
		this.$$lastDirtyWatch = null
	}

	$watch(watchFn, listenerFn, valueEq) {
		let watcher = {
			watchFn: watchFn,
			listenerFn: listenerFn || function() {},
			valueEq: !!valueEq,
			last: this.initWatchVal
		}
		this.$$watchers.push(watcher)
		//does not end the digest so that the new watches are not run
		this.lastDirtyWatch = null
	}
	
	$$areEqual(newValue, oldValue, valueEq) {
		if(valueEq) {
			//console.log(newValue)
			//console.log(oldValue)
			return _.isEqual(newValue, oldValue)
		} else {
			return newValue === oldValue ||
			    //solve the corn case for NaN
						 (typeof newValue === 'number' && typeof oldValue === 'number' &&
						 	isNaN(newValue) && isNaN(oldValue))
		}
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
			if(!self.$$areEqual(newValue, oldValue, watcher.valueEq)) {
				self.lastDirtyWatch = watcher
				watcher.last = (watcher.valueEq ? _.cloneDeep(newValue) : newValue)
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

	$eval(expression, locals) {
		return expression(this, locals)
	}
}