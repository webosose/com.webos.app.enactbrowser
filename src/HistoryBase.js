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

/**
 entry stucture : {
    id :
    url :
    date :
    title :
 }
*/
class HistoryBase {
    constructor(store, storage) {
        this.store = store;
        this.storage = storage;
        //this.storage = new InMemoryHistory();
    }

    initialize() {
        console.info('HistoryBase::initialize() is not implemented');
    }

    // interface for Browser
    addEntry(url, title='') {
        return this.storage.add({
            url: url,
            title: title,
            date: new Date()
        });
    }

    // private
    updateEntryTitle(url, title) {
        this.storage.updateTitle(url, title);
    }

    // If empty params - all history
    retrieveByDate(from, to) {
        const store = this.store;
        this.storage.getEntriesByDate(
            from,
            to,
            (data) => {
                this.store.update(data.reverse());
            }
        );
    }

    //retrieves in reverse order of adding
    retrieveByPos(from, to) {
        const store = this.store;
        this.storage.getEntriesByPos(
            from,
            to,
            (data) => {
                this.store.update(data.reverse());
            }
        );
    }

    clearByIds(ids, oncomplete) {
        const obj = this;
        this.storage.clearByIds(ids, oncomplete);
    }

    clearAll() {
        this.storage.clearAll();
        this.store.update([]);
    }

}

export {HistoryBase};