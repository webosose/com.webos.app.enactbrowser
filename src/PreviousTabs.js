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

class PreviousTabs {
    constructor(storage, tabs) {
        this.storage = storage;
        tabs.addEventListener('add', this.handleTabAdd);
        tabs.addEventListener('update', this.handleTabUpdate);
        tabs.addEventListener('delete', this.handleTabDelete);
        tabs.addEventListener('move', this.handleTabMove);
        tabs.addEventListener('replace', this.handleTabReplace);
    }

    get() {
        return this.storage.get();
    }

    reset() {
        return this.storage.reset();
    }

    handleTabAdd = (ev) => {
        this.storage.add(this._createTabInfo(ev.tab));
    }

    handleTabUpdate = (ev) => {
        if (ev.diff.navState && ev.diff.navState.url) {
            const state = ev.state;
            this.storage.update({
                id: state.id,
                type: state.type,
                url: state.navState.url
            })
        }
    }

    handleTabDelete = (ev) => {
        this.storage.remove(ev.tab.id);
    }

    handleTabMove = (ev) => {
        this.storage.move(ev.from, ev.to);
    }

    handleTabReplace = (ev) => {
        this.storage.replace(ev.index, this._createTabInfo(ev.state));
    }

    _createTabInfo = (tab) => ({
        id: tab.id,
        type: tab.type,
        url: tab.navState.url
    })
}

export default PreviousTabs;
export {PreviousTabs};