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

const STORE_NAME = 'most-visited-sites';

class MostVisitedSitesIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(
            STORE_NAME,
            {keyPath: 'id', autoIncrement: true},
            (store) => {
                store.createIndex('url','url', {unique: true});
                store.createIndex('hitCount','hitCount', {unique: false});
            }
        );
    }

    //adds new entry or increment hit counter
    add(entry) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const request = store.store.index('url').openCursor(entry.url);
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        const updatedEntry = cursor.value;
                        updatedEntry.hitCount++;
                        cursor.update(updatedEntry);
                        resolve([store, updatedEntry]);
                    }
                    else {
                        const newEntry = {hitCount: 1, ...entry};
                        store.request('add', [newEntry]).then(() => {
                            resolve([store, newEntry]);
                        });
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            });
        });
    }

    update(entry) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const request = store.store.index('url').openCursor(entry.url);
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        const updatedEntry = cursor.value;
                        updatedEntry.title = entry.title;
                        cursor.update(updatedEntry);
                        resolve([store, updatedEntry]);
                    }
                    else {
                        resolve([store, undefined]);
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            });
        });
    }

    get(number) {
        return this.db.transaction('readonly', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const request =
                    store.store.index('hitCount').openCursor(null, 'prev');
                const arr = [];
                let i = 0;
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor && i < number) {
                        i++;
                        arr.push(cursor.value);
                        cursor.continue();
                    }
                    else {
                        resolve([store, arr]);
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            });
        });
    }

    getNth(pos, skipUrl) {
        return this.db.transaction('readonly', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const request =
                    store.store.index('hitCount').openCursor(null, 'prev');
                let advanced = false;
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        if (!advanced) {
                            cursor.advance(pos - 1);
                            advanced = true;
                        }
                        else if (cursor.value.url === skipUrl) {
                            cursor.continue();
                        }
                        else {
                            resolve([store, cursor.value])
                        }
                    }
                    else {
                        resolve([store, null]);
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            });
        });
    }


    getSuggestions(pattern, number) {
        return this.db.transaction('readonly', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const request =
                    store.store.index('hitCount').openCursor(null, 'prev');
                const arr = [];
                let i = 0;
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor && cursor.value.url.indexOf(pattern) !== -1) {
                        i++;
                        arr.push(cursor.value);
                    }
                    if (cursor && i < number) {
                        cursor.continue();
                    }
                    else {
                        resolve([store, arr]);
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            });
        });
    }

    // TODO: may be reversed array needed
    getAll() {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', [], 'hitCount'));
    }

    remove(url) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const request = store.store.index('url').openCursor(url);
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        const url = cursor.value.url;
                        cursor.delete();
                        resolve([store, url]);
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            });
        });
    }

    removeAll() {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }
}

export default MostVisitedSitesIdbStorage;
export {MostVisitedSitesIdbStorage};