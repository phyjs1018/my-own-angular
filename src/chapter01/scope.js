class Scope {
	constructor() {
		this.$$watchers = []
		this.initWatchVal = () => {}
	}

	$watch(watchFn, listenerFn) {
		let watcher = {
			watchFn: watchFn,
			listenerFn: listenerFn,
			last: this.initWatchVal
		}
		this.$$watchers.push(watcher)
	}

	$digest() {
		let self = this
		let newValue, oldValue
		_.forEach(this.$$watchers, (watcher) => {
			newValue = watcher.watchFn(self)
			oldValue = watcher.last
			if(newValue !== oldValue) {
				watcher.listenerFn(newValue, 
						(oldValue === self.initWatchVal ? newValue : oldValue), 
							self)
			}
		})
	}
}