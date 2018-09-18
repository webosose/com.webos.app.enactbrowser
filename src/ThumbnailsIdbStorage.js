// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

const STORE_NAME = 'site-thumbnails';

class ThumbnailsIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(STORE_NAME, {keyPath: 'url'});
    }

    add(entry) {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('add', [entry])
        );
    }

    exists(url) {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('count', [IDBKeyRange.only(url)])).then((result) => {
                return !!result;
            });
    }

    get(url) {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('get', [url]));
    }

    getAll() {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', []));
    }

    remove(url) {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('delete', [url]));
    }

    removeAll() {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }
}

export default ThumbnailsIdbStorage;
export {ThumbnailsIdbStorage};