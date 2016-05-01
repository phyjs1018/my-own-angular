//scope events
//publish-subscribe messaging
describe('Events', function() {
  var parent
  var scope
  var child
  var isolatedChild

  beforeEach(function() {
    parent = new Scope()
    scope = parent.$new()
    child = scope.$new()
    isolatedChild = scope.$new(true)
  })

  //registering event listeners: $on
  it('allows registering listeners', function() {
    var listen1 = function() { }
    var listen2 = function() { }
    var listen3 = function() { }

    scope.$on('someEvent', listen1)
    scope.$on('someEvent', listen2)
    scope.$on('someOtherEvent', listen3)

    expect(scope.$$listeners).toEqual({
      someEvent: [listen1, listen2],
      someOtherEvent: [listen3]
    })
  })

  it('registers different listeners for every scope', function() {
    var listener1 = function() { }
    var listener2 = function() { }
    var listener3 = function() { }

    scope.$on('someEvent', listener1)
    child.$on('someEvent', listener2)
    isolatedChild.$on('someEvent', listener3)

    expect(scope.$$listeners).toEqual({someEvent: [listener1]})
    expect(child.$$listeners).toEqual({someEvent: [listener2]})
    expect(isolatedChild.$$listeners).toEqual({someEvent: [listener3]})
  })

  //the basic of $emit and $broadcast
  //dealing with duplication
  _.forEach(['$emit', '$broadcast'], function(method) {
    it('calls the listeners of the matching event on' + method, function() {
      var listener1 = jasmine.createSpy()
      var listener2 = jasmine.createSpy()
      scope.$on('someEvent', listener1)
      scope.$on('someOtherEvent', listener2)

      scope[method]('someEvent')

      expect(listener1).toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })

    //event objects
    it('passes an event object with a name to listeners on' + method, function() {
      var listener = jasmine.createSpy()
      scope.$on('someEvent', listener)

      scope[method]('someEvent')

      expect(listener).toHaveBeenCalled()
      expect(listener.calls.mostRecent().args[0].name).toEqual('someEvent')
    })

    it('passes the same event object to each listener on' + method, function() {
      var listener1 = jasmine.createSpy()
      var listener2 = jasmine.createSpy()
      scope.$on('someEvent', listener1)
      scope.$on('someEvent', listener2)

      scope[method]('someEvent')

      var event1 = listener1.calls.mostRecent().args[0]
      var event2 = listener2.calls.mostRecent().args[0]

      expect(event1).toBe(event2)
    })

    //additional listener arguments
    it('passes additional arguments to listeners on' + method, function() {
      var listener = jasmine.createSpy()
      scope.$on('someEvent', listener)

      scope[method]('someEvent', 'and', ['additional', 'arguments'], '...')

      expect(listener.calls.mostRecent().args[1]).toEqual('and')
      expect(listener.calls.mostRecent().args[2]).toEqual(['additional', 'arguments'])
      expect(listener.calls.mostRecent().args[3]).toEqual('...')
    })

    //returning the event object
    it('returns the event object on' + method, function() {
      var returnedEvent = scope[method]('someEvent')

      expect(returnedEvent).toBeDefined()
      expect(returnedEvent.name).toEqual('someEvent')
    })

    //deregistering event listeners
    it('can be deregistering' + method, function() {
      var listener = jasmine.createSpy()
      var deregistering = scope.$on('someEvent', listener)

      deregistering()

      scope[method]('someEvent')

      expect(listener).not.toHaveBeenCalled()
    })

    //one special case we must be careful
    it('does not skip the next listener when removed on' + method, function() {
      var deregister

      var listener = function() {
        deregister()
      }
      var nextListener = jasmine.createSpy()

      deregister = scope.$on('someEvent', listener)
      scope.$on('someEvent', nextListener)

      scope[method]('someEvent')

      expect(nextListener).toHaveBeenCalled()
    })
  })
})
