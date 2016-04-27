//set the default value of watch.last and make it unqiue
//we would rather not leak that function outside of scope
const initWatchVal = () => {}

class Scope {
	constructor() {
		this.$$watchers = []
		this.$$asyncQueue = []
		this.$$applyAsyncQueue = []
		this.$$postDigestQueue = []
		this.$$lastDirtyWatch = null
		this.$$applyAsyncId = null
		this.$$phase = null
	}

	$watch(watchFn, listenerFn, valueEq) {
		let self = this
		let watcher = {
			watchFn: watchFn,
			listenerFn: listenerFn || function() {},
			valueEq: !!valueEq,
			last: initWatchVal
		}
		this.$$watchers.unshift(watcher)
		//does not end the digest so that the new watches are not run
		this.lastDirtyWatch = null

		return function() {
			var index = self.$$watchers.indexOf(watcher)
			if(index >= 0) {
				self.$$watchers.splice(index, 1)
				self.$$lastDirtyWatch = null
			}
		}
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
		this.$beginPhase('$digest')

		if(this.$$applyAsyncId) {
			clearTimeout(this.$$applyAsyncId)
			this.$$flushApplyAsync()
		}

		do {
			while (this.$$asyncQueue.length) {
				try {
					var asyncTask = this.$$asyncQueue.shift()
					asyncTask.scope.$eval(asyncTask.expression)
				} catch (e) {
					console.error(e)
				}
			}
			dirty = this.$digestOnce()
			//console.log(dirty)
			//we need to do is also check the status of the async queue in our TTL check
			if((dirty || this.$$asyncQueue.length) && !(ttl--)) {
				this.$clearPhase()
				throw "10 digest iteration reached"
			}
		} while (dirty || this.$$asyncQueue.length)
		this.$clearPhase()

		while (this.$$postDigestQueue.length) {
			try {
				this.$$postDigestQueue.shift()()
			} catch(e) {
				console.error();(e)
			}
		}
	}

	$digestOnce() {
		let self = this
		let newValue, oldValue, dirty
		_.forEachRight(self.$$watchers, (watcher) => {
		 try{
			if(watcher) {
			newValue = watcher.watchFn(self)
			oldValue = watcher.last
			if(!self.$$areEqual(newValue, oldValue, watcher.valueEq)) {
				self.lastDirtyWatch = watcher
				watcher.last = (watcher.valueEq ? _.cloneDeep(newValue) : newValue)
				watcher.listenerFn(newValue,
					//we'd rather not leak that function outside of scope.js
						(oldValue === initWatchVal ? newValue : oldValue),
							self)
				dirty = true
			} else if (self.lastDirtyWatch === watcher) {
				//short-circuiting the digest when the last watch is clean
				return false
			}
		}
		} catch (e) {
			console.error(e)
		}
		})
		return dirty
}

	$eval(expression, locals) {
		return expression(this, locals)
	}

	$apply(expression) {
		try {
			this.$beginPhase('$apply')
			return this.$eval(expression)
		} finally {
			this.$clearPhase()
			this.$digest()
		}
	}

	$$postDigest(fn) {
		this.$$postDigestQueue.push(fn)
	}

	$evalAsync(expr) {
		let self = this
		//the $evalAsync function can now check the current phase of the scope, and if there isn't one, schedule the digest
		if(!self.$$phase && !self.$$asyncQueue.length) {
			setTimeout(function() {
				if(self.$$asyncQueue.length) {
					self.$digest()
				}
			}, 0)
		}
		this.$$asyncQueue.push({scope: this, expression: expr})
	}

	$applyAsync(expr) {
		let self = this
		self.$$applyAsyncQueue.push(function() {
			self.$eval(expr)
		})

		if(self.$$applyAsyncId === null) {
			self.$$applyAsyncId = setTimeout(function() {
				self.$apply(_.bind(self.$$flushApplyAsync, self))
			}, 0)
		}
	}

	$$flushApplyAsync() {
		while(this.$$applyAsyncQueue.length) {
			this.$$applyAsyncQueue.shift()()
		}
		this.$$applyAsyncId = null
	}

	$beginPhase(phase) {
		if(this.$$phase) {
			throw this.$$phase + 'already in progress'
		}
		this.$$phase = phase
	}

	$clearPhase() {
		this.$$phase = null
	}
}
