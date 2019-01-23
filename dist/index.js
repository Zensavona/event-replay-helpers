'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// helpers to serialise and rehydrate MouseEvent/TouchEvent
var isTouchEvent = function (event) {
    return event.type.indexOf('touch') !== -1;
};
var isMouseEvent = function (event) {
    return event.type.indexOf('mouse') !== -1;
};
var getXPathFromElement = function (element) {
    if (element.id !== '') {
        return 'id("' + element.id + '")';
    }
    if (element === document.body) {
        return element.tagName;
    }
    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element) {
            return getXPathFromElement(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
            ix++;
        }
    }
    // if we get here there's a problem, but an empty xpath is the correct "error" for not found
    return '';
};
var getElementByXPath = function (xpath) { return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; };
var rehydrateTouchEvent = function (event, target) {
    var touchObj = new Touch({
        identifier: Date.now(),
        target: target,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        pageX: event.clientX,
        pageY: event.clientY
    });
    return new TouchEvent(event.type, {
        cancelable: true,
        bubbles: true,
        touches: [touchObj],
        targetTouches: [touchObj],
        changedTouches: [touchObj]
    });
};
var rehydrateMouseEvent = function (event) {
    var mouseEventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY
    };
    return new MouseEvent(event.type, mouseEventInit);
};
var rehydrateSerialisedEvent = function (event) {
    var target = getElementByXPath(event.xpath);
    if (event.type.indexOf('touch') !== -1) {
        var touchEvent_1 = rehydrateTouchEvent(event, target);
        return function () {
            target.dispatchEvent(touchEvent_1);
            return touchEvent_1;
        };
    }
    else {
        var mouseEvent_1 = rehydrateMouseEvent(event);
        return function () {
            target.dispatchEvent(mouseEvent_1);
            return mouseEvent_1;
        };
    }
};
var serialiseMouseEvent = function (event, startTimeStamp) { return ({
    type: event.type,
    screenX: event.screenX,
    screenY: event.screenY,
    clientX: event.clientX,
    clientY: event.clientY,
    timeStamp: Math.round(event.timeStamp - startTimeStamp),
    xpath: getXPathFromElement(event.target)
}); };
var serialiseTouchEvent = function (event, startTimeStamp) { return ({
    type: event.type,
    screenX: Math.round(event.changedTouches[0].screenX),
    screenY: Math.round(event.changedTouches[0].screenY),
    clientX: Math.round(event.changedTouches[0].clientX),
    clientY: Math.round(event.changedTouches[0].clientY),
    timeStamp: Math.round(event.timeStamp - startTimeStamp),
    xpath: getXPathFromElement(event.target)
}); };
var serialiseEvent = function (e, startTimeStamp) {
    if (startTimeStamp === void 0) { startTimeStamp = 0; }
    if (isTouchEvent(e)) {
        return serialiseTouchEvent(e, startTimeStamp);
    }
    else {
        return serialiseMouseEvent(e, startTimeStamp);
    }
};

exports.isTouchEvent = isTouchEvent;
exports.isMouseEvent = isMouseEvent;
exports.rehydrateSerialisedEvent = rehydrateSerialisedEvent;
exports.serialiseEvent = serialiseEvent;
