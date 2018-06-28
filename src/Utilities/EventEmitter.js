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