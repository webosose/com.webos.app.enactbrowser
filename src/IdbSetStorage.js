// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
    Storage to store primitive values in a set
*/
class IdbSetStorage {
    constructor(storeName, db) {
        this.storeName = storeName;
        this.db = db;
        var store = db.addObjectStore(storeName, {keyPath: ''});
    }

    exists(value) {
        return this.transaction('readonly', (store) =>
                store.request('count', [value]))
            .then((result) => result.value > 0);
    }

    getAll() {
        return this.db.transaction('readonly', this.storeName,
            (store) => store.request('getAll', []));
    }

    set(value) {
        return this.db.transaction('readwrite', this.storeName,
            (store) => store.request('put', [value]));
    }

    setValues(values) {
        return this.db.transaction('readwrite', this.storeName, (store) => {
                const requests = [];
                for (let value of values) {
                    requests.push(store.request('put', [value]));
                }
                return Promise.all(requests);
            }
        );
    }

    remove(value) {
        return this.db.transaction('readwrite', this.storeName,
            (store) => store.request('delete', [value]));
    }

    removeValues(values) {
        return this.db.transaction('readwrite', this.storeName, (store) => {
                const requests = [];
                for (let value of values) {
                    requests.push(store.request('delete', [value]));
                }
                return Promise.all(requests);
            }
        );
    }

    removeAll() {
        return this.db.transaction('readwrite', this.storeName,
            (store) => store.request('clear', []));
    }
}

export default IdbSetStorage;
export {IdbSetStorage};
