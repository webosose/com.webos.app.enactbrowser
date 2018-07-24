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

const STORE_NAME = 'bookmarks';

class BookmarksIdbStorage {
    constructor(db) {
        this.storage = new IdbOrderedStorage(db, STORE_NAME, 'url');
    }

    initialize(defaults) {
        return this.storage.initialize((store, count) => {
                const requests = [];
                if (count === 0) {
                    defaults.forEach((bookmark) => {
                        bookmark.pos = count++;
                        requests.push(store.request('add', [bookmark]));
                    });
                }
                return Promise.all(requests).then(() => count);
            }
        );
    }

    count() {
        return this.storage.count();
    }

    isBookmarked(url) {
        return this.storage.exists(url);
    }

    getAll() {
        return this.storage.getAll();
    }

    get(from, to) {
        return this.storage.get(from, to);
    }

    add(url, title, icon) {
        return this.storage.add({url, title, icon});
    }

    insert(url, title, icon, pos) {
        return this.storage.insert(pos, {url, title, icon});
    }

    move(from, to) {
        return this.storage.move(from, to);
    }

    remove(urls) {
        return this.storage.remove(urls);
    }

    removeAll() {
        return this.storage.removeAll();
    }

}

export default BookmarksIdbStorage;
export {BookmarksIdbStorage};
