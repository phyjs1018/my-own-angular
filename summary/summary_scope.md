Scope - Angular's dirty-checking
- The two-side process underlying Angular's dirty-checking: $watch and $digest
- The dirty-checking loop and the TTL mechanism for short-circuiting it
- The difference between reference-based and value-based comparison
- Executing function on the digest loop in different ways: Immediately with $eval and $apply and time-shifted with $evalAsync, $applyAsync, and $$postDigest
- Exception handing in the Angular digest
- Destroying watches so they won't get executed again
- Watching several things with a single effect using the $watchGroup function


Scope inheritance
- How child scopes are created
- The relationship between scope inheritance and javascript's native prototypal inheritance
- Attribute shadowing and its implications
- Recursive digest from a parent scope to its child scopes
- The difference between $digest and $apply when it comes to the starting point of digestion
- Isolated scopes and how they differ from normal child scopes
- How child scopes are destroyed

Watching collections
- How $watchCollection can be used with arrays, objects, and other values
- What $watchCollection does with arrays
- What $watchCollection does with arrays
- Array-like objects and their role in $watchCollection

Scope Events
- How Angular's event system builds on the classic pub/sub pattern
- How event listeners are registered on scopes
- How events are fired on scopes
- What the differences between $emit and $broadcast are
- What the contents of scope event objects are
- How some of the scope attributes are modeled after the DOM event model
- When and how scope events can be stopped
