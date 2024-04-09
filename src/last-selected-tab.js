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


const STORE_NAME = 'last-selected-tab';

/**
Tab info structure:
{
    id,
    type,
    url,
    pos (will be present when returning from getInfo)
}
*/

class LastSelectedTab {
    constructor(db, tabs) {
        this.db = db;
        this.tabs = tabs;
        db.addObjectStore(STORE_NAME, {keyPath: 'id'}, (store) => {});
        this.turnOn();
    }

    get() {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', []));
    }

    reset() {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }

    setSelectedTab(tab) {
        return this.db.transaction('readwrite', STORE_NAME, (store) => {
                return store.request('put', [{
                    id: 'lst',
                    type: tab.type,
                    url: tab.navState.url
                }]);
        });
    }

    turnOn() {
        this.tabs.addEventListener('select', this.handleTabSelect);
        this.tabs.addEventListener('update', this.handleTabUpdate);
    }

    turnOff() {
        this.tabs.removeEventListener('select', this.handleTabSelect);
        this.tabs.removeEventListener('update', this.handleTabUpdate);
    }

    handleTabSelect = () => {
        this.setSelectedTab(this.tabs.getSelectedTab().state);
    }

    handleTabUpdate = (ev) => {
        if (ev.diff.navState && ev.diff.navState.url) {
            this.setSelectedTab(ev.state);
        }
    }
}

export default LastSelectedTab;
export {LastSelectedTab};
