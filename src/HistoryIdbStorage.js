// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

const STORE_NAME = 'history';

class HistoryIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(STORE_NAME, {keyPath: 'id', autoIncrement: true});
    }

    add(url, title, date) {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('add', [url, title, date])
        );
    }

    updateTitle(url, title) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
            const objectStore = store.store;
            const request = objectStore.openCursor(null, 'prev');
            request.onsuccess = (ev) => {
                const cursor = ev.target.result;
                if (cursor) {
                    if (cursor.value.url === url) {
                        cursor.value.title = title;
                        cursor.update(cursor.value);
                    }
                    else {
                        cursor.continue();
                    }
                }
            }
            return Promise.resolve([store, true]);
        });
    }

    getAllEntries(onsuccess) {
        this.db.transaction('readonly', STORE_NAME, (store) => store.request('getAll', []))
        .then((result) => {
            onsuccess(result);
        });
    }

    getEntriesByDate(from, to, onsuccess) {
        console.warn('--- HistoryIdbStorage::getEntriesByDate returns all entries');
        this.getAllEntries(onsuccess);
    }

    getEntriesByPos(from, to, onsuccess) {
        console.warn('--- HistoryIdbStorage::getEntriesByPos returns all entries');
        this.getAllEntries(onsuccess);
    }

    clearByIds(ids, oncomplete) {
        this.db.transaction('readwrite', STORE_NAME, (store) => {
            ids.forEach((id) => {
                store.request('delete', [id]);
            });
            return Promise.resolve([store, true]);
        }).then(() => {
            if (oncomplete) {
                oncomplete();
            }
        });
    }

    clearAll() {
        return this.db.transaction('readwrite', STORE_NAME,
            (store) => store.request('clear', []));
    }

}

export default HistoryIdbStorage;
export {HistoryIdbStorage};
