# Event Serialisation / Rehydration Helpers

Ever needed to save JavaScript (mouse/touch) events to the server to be replayed later? I did once, so now you have this shitty library.

`yarn add event-replay-helpers`

-> ![alt Demo GIF](https://i.imgur.com/jeKfoZO.gif) <-

Currently only works for `mousemove`, `mousedown`, `mouseup`, `mouseover`, `click`, `touchstart`, `touchmove`, and `touchend` for potential security reasons - I will deal with this soon (maybe)

```JavaScript
import { rehydrateSerialisedEvent, serialiseEvent } from 'event-replay-helpers'

// the serialiseEvent function also accepts an optional startTimeStamp (number) - useful for recording a bunch of events with offsets to play them back at

document.addEventListener('click', (e) => {
  // serialise it, this can be sent to the server and stored in a database if you like
  const serialisedEvent = serialiseEvent(e)

  // wait a second and play it again
  setTimeout(() => {
    // this actually a function that dispatches the event when we call it, then returns the event as it's result
    const dispatchEvent = rehydrateSerialisedEvent(e)
    const rehydratedEvent = dispatchEvent()
  }, 1000)
})
```

To better understand how it works and how to use it, just have a look at the `index.ts` - it's only ~130 lines of code.
