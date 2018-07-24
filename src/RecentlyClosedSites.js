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

import {TabTypes} from './TabsConsts';

class RecentlyClosedSites {
    constructor(storage, tabs, maxTabsToStore = 10) {
        this.storage = storage;
        this.maxTabsToStore = maxTabsToStore;
        this.count = null;
        this.earliestId = null;
        tabs.addEventListener('delete', this.handleTabDelete);
        tabs.addEventListener('replace', this.handleTabReplace);
    }

    initialize() {
        this.storage.getAll().then((result) => {
            this.count = result.length;
            return Promise.resolve(result);
        });
    }

    getAll() {
        return this.storage.getAll();
    }

    remove(id) {
        const rct = this;
        this.storage.remove(id).then((result) => {
            rct.count--;
            return Promise.resolve(result);
        });
    }

    removeAll() {
        this.count = 0;
        return this.storage.removeAll();
    }

    _addEntry(entry) {
        let promise;
        if (this.count >= this.maxTabsToStore) {
            promise = this.storage.removeFirst();
        }
        else {
            this.count++;
            promise = Promise.resolve();
        }
        promise.then(() => {
            return this.storage.add(entry);
        });
    }

    handleTabDelete = (ev) => {
        if (ev.state.type === TabTypes.WEBVIEW) {
            this._addEntry({
                url: ev.state.navState.url,
                title: ev.state.title
            });
        }
    }

    handleTabReplace = (ev) => {
        if (ev.oldState.type === TabTypes.WEBVIEW) {
            this._addEntry({
                url: ev.oldState.navState.url,
                title: ev.oldState.title
            });
        }
    }
}

export default RecentlyClosedSites;
export {RecentlyClosedSites};