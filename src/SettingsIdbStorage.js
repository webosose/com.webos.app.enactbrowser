// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

const STORE_NAME = 'settings';

function _put(store, values, keys, i) {
    if (i < keys.length) {
        const key = keys[i],
              value = values[keys[i]];
        return store.request('put', [{key, value}])
            .then(() => _put(store, values, keys, ++i));
    }
    else {
        return Promise.resolve([store, keys]);
    }
}

class SettingsIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(STORE_NAME, {keyPath: 'key'});
    }

    get(k) {
        return this.db.transaction('readonly', STORE_NAME,
                (store) => store.request('get', [k]))
            .then((result) => result.value);
    }

    getAll() {
        const promise = this.db.transaction('readonly', STORE_NAME,
            (store) => store.request('getAll', []));
        return promise.then((result) => {
                const obj = {};
                result.forEach((kvObject) => {
                    obj[kvObject.key] = kvObject.value;
                });
                return obj;
            });
    }

    set(k, v) {
        return this.db.transaction('readwrite', STORE_NAME,
            (store) => store.request('put', [{key: k, value: v}]));
    }

    setValues(valuesObj) {
        return this.db.transaction('readwrite', STORE_NAME,
            (store) => _put(store, valuesObj, Object.keys(valuesObj), 0));
    }
}

export {SettingsIdbStorage};