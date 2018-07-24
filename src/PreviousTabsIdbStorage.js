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

import {IdbOrderedStorage} from './IdbOrderedStorage.js';

const STORE_NAME = 'prev-tabs';

/**
Tab info structure:
{
    id,
    type,
    url,
    pos (will be present when returning from getInfo)
}
*/
class PreviousTabsIdbStorage {
    constructor(db) {
        this.storage = new IdbOrderedStorage(db, STORE_NAME, 'id');
    }

    get() {
        return this.storage.getAll();
    }

    reset() {
        //TODO: reset with array of new infos
        return this.storage.removeAll();
    }

    getAndReset() {
        const storage = this.storage;
        return storage.getAll().then((tabsInfo) => {
            return storage.removeAll().then(() => tabsInfo);
        });
    }

    add(tabInfo) {
        return this.storage.add(tabInfo);
    }

    update(tabInfo) {
        return this.storage.set(tabInfo);
    }

    remove(id) {
        return this.storage.remove([id]);
    }

    insert(pos, tabInfo) {
        return this.storage.insert(pos, tabInfo);
    }

    move(from, to) {
        return this.storage.move(from, to);
    }

    replace(pos, newInfo) {
        return this.storage.db.transaction('readwrite', STORE_NAME, (store) => {
            return store.request('get', [pos], 'pos').then((result) => {
                return store.request('delete', [result[1].id]);
            }).then(() => {
                return store.request('add', [{pos, ...newInfo}]);
            })
        });
    }
}

export default PreviousTabsIdbStorage;
export {PreviousTabsIdbStorage};
