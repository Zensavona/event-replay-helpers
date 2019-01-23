// helpers to serialise and rehydrate MouseEvent/TouchEvent

export interface SerialisedEvent {
  type: string
  screenX: number
  screenY: number
  clientX: number
  clientY: number
  timeStamp: number
  xpath: string
}

type MouseOrTouchEvent = MouseEvent | TouchEvent

export const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return (<TouchEvent>event).type.indexOf('touch') !== -1;
}

export const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => {
  return (<MouseEvent>event).type.indexOf('mouse') !== -1;
}

const getXPathFromElement = (element: any): string => {
  if (element.id !== '') {
    return 'id("' + element.id + '")'
  }

  if (element === document.body) {
    return element.tagName
  }

  let ix = 0
  const siblings = element.parentNode.childNodes

  for (let i = 0; i<siblings.length; i++) {
    const sibling = siblings[i]
    if (sibling === element) {
      return getXPathFromElement(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']'
    }
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++
    }
  }

  // if we get here there's a problem, but an empty xpath is the correct "error" for not found
  return ''
}

const getElementByXPath = (xpath: string): Node => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue

const rehydrateTouchEvent = (event: SerialisedEvent, target: Node): TouchEvent => {
  const touchObj = new Touch({
    identifier: Date.now(),
    target,
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY,
    pageX: event.clientX,
    pageY: event.clientY
  })
  return new TouchEvent(event.type, {
    cancelable: true,
    bubbles: true,
    touches: [touchObj],
    targetTouches: [touchObj],
    changedTouches: [touchObj]
  })
}

const rehydrateMouseEvent = (event: SerialisedEvent): MouseEvent => {
  const mouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY
  }
  return new MouseEvent(event.type, mouseEventInit)
}

interface ReturnFunction<EventType> {
  (): EventType
}

export const rehydrateSerialisedEvent = (event: SerialisedEvent): ReturnFunction<MouseOrTouchEvent> => {
  const target = getElementByXPath(event.xpath)
  if (event.type.indexOf('touch') !== -1) {
    const touchEvent = rehydrateTouchEvent(event, target)
    return () => {
      target.dispatchEvent(touchEvent)
      return touchEvent
    }
  } else {
    const mouseEvent = rehydrateMouseEvent(event)
    return () => {
      target.dispatchEvent(mouseEvent)
      return mouseEvent
    }
  }
}

const serialiseMouseEvent = (event: MouseEvent, startTimeStamp: number): SerialisedEvent => ({
  type: event.type,
  screenX: event.screenX,
  screenY: event.screenY,
  clientX: event.clientX,
  clientY: event.clientY,
  timeStamp: Math.round(event.timeStamp - startTimeStamp),
  xpath: getXPathFromElement(event.target)
})

const serialiseTouchEvent = (event: TouchEvent, startTimeStamp: number): SerialisedEvent => ({
  type: event.type,
  screenX: Math.round(event.changedTouches[0].screenX),
  screenY: Math.round(event.changedTouches[0].screenY),
  clientX: Math.round(event.changedTouches[0].clientX),
  clientY: Math.round(event.changedTouches[0].clientY),
  timeStamp: Math.round(event.timeStamp - startTimeStamp),
  xpath: getXPathFromElement(event.target)
})

export const serialiseEvent = (e: MouseOrTouchEvent, startTimeStamp = 0): SerialisedEvent => {
  if (isTouchEvent(e)) {
    return serialiseTouchEvent(e, startTimeStamp)
  } else {
    return serialiseMouseEvent(e, startTimeStamp)
  }
}
