// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

function _rangeRequest(store, from, to) {
    if (from > to) {
        from = [to, to = from][0]; //swap
    }
    return store.request('getAll', [IDBKeyRange.bound(from, to)], 'pos');
}

function _shiftRight(store, requests, values, from, to) {
    for (let i = from; i >= to; i--) {
        values[i].pos++;
        requests.push(store.request('put', [values[i]]));
    }
}

function _shiftLeft(store, requests, values, from, to) {
    for (let i = from; i <= to; i++) {
        values[i].pos--;
        requests.push(store.request('put', [values[i]]));
    }
}

class IdbOrderedStorage {
    constructor(db, storeName, keyPath) {
        this.db = db;
        this.storeName = storeName;
        this._count = 0;
        this.db.addObjectStore(storeName, {keyPath}, (store) => {
            store.createIndex('pos','pos', {unique: true});
        });
    }

    // initFunction params:
    //     store - store object for this storage
    //     count - number of objects stored in storage
    // initFunction return value:
    //     promise with number of initilized entries
    initialize(initFunction) {
        const thisStorage = this;

        return this.db.transaction('readwrite', this.storeName, (store) => {
            return store.request('count', []).then((results) => {
                let count = results[1];
                return initFunction(store, count)
                    .then((newCount) => [results[0], newCount]);
            });
        })
        .then((count) => {
            thisStorage._count = count;
            return count;
        });
    }

    count() {
        return this._count;
    }

    exists(id) {
        return this.db.transaction('readonly', this.storeName, (store) =>
            store.request('count', [IDBKeyRange.only(id)]));
    }

    // returns all values from storage ordered by theur position
    getAll() {
        return this.db.transaction('readonly', this.storeName, (store) =>
            store.request('getAll', [], 'pos'));
    }

    get(from, to) {
        return this.db.transaction('readonly', this.storeName, (store) =>
            store.request('getAll', [IDBKeyRange.bound(from, to)], 'pos'));
    }

    set(item) {
        return this.db.transaction('readwrite', this.storeName, (store) =>
            store.request('get', [{id: item.id}]).then((result) =>
                request('put', [{pos: result.pos, ...item}]))
        );
    }

    add(item) {
        const pos = this._count++;
        return this.db.transaction('readwrite', this.storeName, (store) =>
            store.request('add', [{pos, ...item}])
        );
    }

    insert(pos, item) {
        if (pos >= this._count) {
          return this.add(item);
        }
        const thisStorage = this;
        return this.db.transaction('readwrite', this.storeName, (store) => {
            const promise = _rangeRequest(store, pos, thisStorage._count - 1);
            return promise.then((result) => {
                const values = result[1];
                const requests = [];

                _shiftRight(store, requests, values, values.length - 1, 0);

                requests.push(store.request('add', [{pos, ...item}]));
                return Promise.all(requests).then((result) => {
                    thisStorage._count++;
                    return result;
                });
            });
        });
    }

    move(from, to) {
        const thisStorage = this;
        return this.db.transaction('readwrite', this.storeName, (store) =>
            _rangeRequest(store, from, to)
            .then((result) => {
                const values = result[1];
                const requests = [];

                const movedPos = from > to ? values.length - 1 : 0;
                values[movedPos].pos = thisStorage.count();
                requests.push(store.request('put', [values[movedPos]]));

                if (from > to) {
                    _shiftRight(store, requests, values, values.length - 2, 0);
                }
                else {
                    _shiftLeft(store, requests, values, 1, values.length - 1);
                }

                values[movedPos].pos = to;
                requests.push(store.request('put', [values[movedPos]]));

                return Promise.all(requests);
            }
        ));
    }

    remove(ids) {
        return this.db.transaction('readwrite', this.storeName, (store) => {
            const thisStorage = this;
            const requests = [];
            ids.forEach((id) => {
                requests.push(store.request('delete', [id]));
            });
            return Promise.all(requests).then((result) => {
                thisStorage._count -= ids.length;
                return result;
            });
        });
    }

    removeAll() {
        this._count = 0;
        return this.db.transaction('readwrite', this.storeName,
            (store) => store.request('clear', []));
    }

}

export default IdbOrderedStorage;
export {IdbOrderedStorage};