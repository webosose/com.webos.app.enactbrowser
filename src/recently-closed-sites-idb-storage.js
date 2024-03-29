// Copyright 2018 LG Electronics, Inc.
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

const STORE_NAME = 'recently-closed-tabs';

/**
Tab entry structure:
{
    id, - autoincrement
    type,
    url,
    title
}
*/
class RecentlyClosedSitesIdbStorage {
    constructor(db, max_entry_num) {
        this.count = 0;
        this.db = db;
        this.db.addObjectStore(STORE_NAME, {keyPath: 'id', autoIncrement: true});
        this.max_entry_num = max_entry_num;

        this.db.didOpen.push( () =>
            this.getAll().then((result) => {
                this.count = result.length;
                return undefined;
            }));
    }

    getAll() {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', []));
    }

    add(entry) {
        let promise;
        promise = this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('add', [entry]));
        if (this.count >= this.max_entry_num) {
            promise.then(() => {
                return this.removeFirst();
            });
        }

        this.count++;
        return promise;
    }

    remove(id) {
        this.count--;
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('delete', [id])
        );
    }

    removeFirst() {
        this.count--;
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
            return new Promise((resolve, reject) => {
                const objectStore = store.store;
                const request = objectStore.openCursor();
                request.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        const delRequest = cursor.delete();
                        delRequest.onsuccess = () => {
                            resolve([store, true]);
                        };
                        delRequest.onerror = () => {
                            reject(delRequest.error);
                        };
                    }
                    else {
                        resolve([store, true]);
                    }
                };
                request.onerror = () => {
                    reject(request.error);
                };
            });
        });
    }

    removeAll() {
        this.count = 0;
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }
}

export default RecentlyClosedSitesIdbStorage;
export {RecentlyClosedSitesIdbStorage};
