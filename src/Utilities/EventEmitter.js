// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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