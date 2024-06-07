// Copyright 2024 LG Electronics, Inc.
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

const STORE_NAME = 'user-agents';

class CustomUserAgentsIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(STORE_NAME, {keyPath: 'hostname'});
    }

    setValues(values) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
            const requests = [];
            for (let value of values) {
                requests.push(store.request('put', [value]));
            }
            return Promise.all(requests);
        });
    }

    getAll() {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', []));
    }

    clear() {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }

}

export default CustomUserAgentsIdbStorage;
export {CustomUserAgentsIdbStorage};
