// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

const STORE_NAME = 'user-agents';

class CustomUserAgentsIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(STORE_NAME, { keyPath: 'hostname' });
    }

    setValues (values) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
                const requests = [];
                for (let value of values) {
                    requests.push(store.request('put', [value]));
                }
                return Promise.all(requests);
            }
        );
    }

    getAll () {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', []));
    }

    clear () {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }

}

export default CustomUserAgentsIdbStorage;
export {CustomUserAgentsIdbStorage};
