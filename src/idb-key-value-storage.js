// Copyright 2019 LG Electronics, Inc.
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
