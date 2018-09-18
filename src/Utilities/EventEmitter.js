// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

class EventEmitter {
    constructor() {
        this._listeners = {};
    }

    addEventListener(eventName, callback) {
        if (typeof callback !== "function") {
            return;
        }
        if (!(eventName in this._listeners)) {
            this._listeners[eventName] = [];
        }
        const listenersForEvent = this._listeners[eventName];
        if (!listenersForEvent.find((element) => (element === callback))) {
            listenersForEvent.push(callback);
        }
    }

    hasEventListener(eventName) {
        return (eventName in this._listeners);
    }

    // eventName - event to emit
    // ev - object with params which will be passed to event hadlers
    emitEvent(eventName, ev) {
        if (eventName in this._listeners) {
            this._listeners[eventName].forEach((callback, index, arr) => {
                callback(ev);
            });
        }
    }
}

export default EventEmitter;