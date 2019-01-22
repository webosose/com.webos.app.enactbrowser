// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

class IdbKeyValueStorage {
    constructor(storeName, db) {
        this.storeName = storeName;
        this.db = db;
        this.db.addObjectStore(storeName, {keyPath: 'key'});
    }

    get(key) {
        return this.db.transaction('readonly', this.storeName,
                (store) => store.request('get', [key]))
            .then((result) => result.value);
    }

    getAll() {
        const promise = this.db.transaction('readonly', this.storeName,
            (store) => store.request('getAll', []));
        return promise.then((result) => {
                const obj = {};
                result.forEach((kvObject) => {
                    obj[kvObject.key] = kvObject.value;
                });
                return obj;
            });
    }

    set(key, value) {
        return this.db.transaction('readwrite', this.storeName,
            (store) => store.request('put', [{key, value}]));
    }

    setValues(valuesObj) {
        return this.db.transaction('readwrite', this.storeName, (store) => {
                const requests = [];
                for (let key in valuesObj) {
                    let value = valuesObj[key];
                    requests.push(store.request('put', [{key, value}]));
                }
                return Promise.all(requests);
            }
        );
    }
}

export default IdbKeyValueStorage;
export {IdbKeyValueStorage};