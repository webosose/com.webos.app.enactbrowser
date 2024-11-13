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

import {TabTypes} from './TabsConsts';

class RecentlyClosedSites {
    constructor(storage, tabs) {
        this.storage = storage;
        this.tabs = tabs;
        this.earliestId = null;
        this.turnOn();
    }

    getAll() {
        return this.storage.getAll();
    }

    remove(id) {
        this.storage.remove(id).then((result) => {
            return Promise.resolve(result);
        });
    }

    removeAll() {
        return this.storage.removeAll();
    }

    turnOn() {
        this.tabs.addEventListener('delete', this.handleTabDelete);
        this.tabs.addEventListener('replace', this.handleTabReplace);
    }

    turnOff() {
        this.tabs.removeEventListener('delete', this.handleTabDelete);
        this.tabs.removeEventListener('replace', this.handleTabReplace);
    }

    _addEntry(entry) {
        let promise = Promise.resolve();
        promise.then(() => {
            return this.storage.add(entry);
        });
    }

    /* jshint ignore:start */
    handleTabDelete = (ev) => {
        if (ev.state.type === TabTypes.WEBVIEW && ev.state.error === null) {
            let p = this._addEntry({
                url: ev.state.navState.url,
                title: ev.state.title
            });
            Promise.all([p]);
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
    /* jshint ignore:end */
}

export default RecentlyClosedSites;
export {RecentlyClosedSites};
