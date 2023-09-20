// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/
let nevaIdbLogOn = false;

class Store {
    constructor(store) {
        this.store = store;
    }

    request(name, params, index = null, requestFn = null) {
        return new Promise((resolve, reject) => {
            const requestSource = index ? this.store.index(index) : this.store;
            const request = requestSource[name](...params);
            request.onsuccess = () => {
                if (requestFn) {
                    requestFn(request);
                }
                resolve([requestSource, request.result]);
            }
            request.onerror = () => {
                console.warn(
                    '--- Store::%s::request::%s::error : %s',
                    request.source.name, name, request.error);
                reject(request.error);
            }
        });
    }
}

class IndexedDb {
    constructor() {
        this.stores = {};
        this.didOpen = [];
        this.db = null;
    }

    addObjectStore(name, options, initFn = null) {
        if (!this.db) {
            this.stores[name] = {options, initFn};
        }
        else {
            console.error('DBConnection is opened, can\'t add object store!');
        }
    }

    open(dbName) {
        nevaIdbLogOn &&
            console.log('--- DBConnection::open::%s', name);
        const thisDBConnection = this;
        const dbVersion = 4;
        return new Promise((resolve, reject) => {
            if (typeof window === 'object') {
                let dbHasUpgraded = false;
                const idbOpenDBRequest = window.indexedDB.open(dbName, dbVersion);

                idbOpenDBRequest.onupgradeneeded = (ev) => {
                    nevaIdbLogOn &&
                        console.log('--- DBConnection::open::%s::onupgradeneeded', dbName);

                    const db = ev.target.result;
                    for(let store_name in thisDBConnection.stores) {
                        if (!db.objectStoreNames.contains(store_name)) {
                            nevaIdbLogOn &&
                                console.log(
                                    '--- DBConnection::open::%s::onupgradeneeded::createObjectStore %s',
                                    dbName,
                                    store_name);
                            const {options, initFn} = thisDBConnection.stores[store_name];
                            const store = db.createObjectStore(store_name, options);
                            if (initFn) {
                                initFn(store);
                            }
                        }
                    };
                    dbHasUpgraded = true;
                }

                idbOpenDBRequest.onsuccess = (ev) => {
                    nevaIdbLogOn &&
                        console.log('--- DBConnection::open::%s::onsuccess', dbName);
                    thisDBConnection.db = ev.target.result;

                    const didOpenPromises = [];
                    this.didOpen.forEach((fn) => {
                        didOpenPromises.push(fn(dbHasUpgraded));
                    });

                    Promise.all(didOpenPromises)
                    .then(() => {
                        resolve(dbHasUpgraded);
                    });
                }

                idbOpenDBRequest.onerror = (ev) => {
                    console.error('--- DBConnection::open::%s::onerror : %s', dbName, ev.target.errorCode);
                    reject(ev.target.errorCode);
                }
            }
        });
    }

    close() {
        this.db.close();
    }

    transaction(readwrite, storeName, requestFn) {
        const db = this.db,
              dbName = this.db.name;

        return new Promise((resolve, reject) => {
            if (!db) {
                console.error('--- IdexedDb::transaction::%s is not initialized', dbName);
                reject('indexedDB is not initialized');
            }
            let result = null;
            const tr = this.db.transaction([storeName], readwrite);
            tr.oncomplete = (ev) => {
                nevaIdbLogOn &&
                    console.log('--- IdexedDb::transaction::%s::%s::oncomplete', dbName, storeName);
                resolve(result);
            }
            tr.onerror = (ev) => {
                const error = ev.target.error;
                console.warn('--- IdexedDb::transaction::%s::%s::onerror %s', dbName, storeName, error);
                console.log(ev.target);
                reject(error);
            }
            requestFn(new Store(tr.objectStore(storeName)))
            .then((params) => {
                result = params[1];
            })
            .catch(() => {});
        });
    }
}

export {IndexedDb};
