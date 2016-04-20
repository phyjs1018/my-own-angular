class Scope {
	constructor() {
		this.$$watchers = []
	}

	$watch(watchFn, listenerFn) {
		let initWatchVal = () => {}
		let watcher = {
			watchFn: watchFn,
			listenerFn: listenerFn,
			last: initWatchVal
		}
		this.$$watchers.push(watcher)
	}

	$digest() {
		let self = this
		let newValue, oldValue
		_forEach(this.$$watchers, (watcher) => {
			newValue = watcher.watchFn(self)
			oldValue = watcher.last
			if(newValue !== oldValue) {
				watcher.listenerFn(newValue, 
						(oldValue === initWatchVal ? newValue : oldValue), 
							self)
			}
		})
	}
}