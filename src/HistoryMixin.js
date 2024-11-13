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

import {BrowserConsts} from './BrowserConsts';
import {TabTitles, TabTypes} from './TabsConsts';

Object.assign(TabTitles, {
    HISTORY_TITLE: 'History'
});

Object.assign(BrowserConsts, {
    HISTORY_URL: 'chrome://history',
    HISTORY_ID: 'history'
});


const HistoryMixin = (superclass) => (class extends superclass {
    constructor({history, ...rest}) {
        super(rest);
        this.history = history;

        this.tabs.addEventListener('update', (ev) => {
            if (!this.settings.getPrivateBrowsing()) {
                if (ev.diff.navState && 'url' in ev.diff.navState) {
                    this.history.addEntry(ev.diff.navState.url);
                }
            }
        });
    }

    clearAllHistory() {
        this.history.clearAll();
    }

    openHistory() {
        this.tabs.addTab(this._createManagePage(
            BrowserConsts.HISTORY_ID,
            TabTypes.HISTORY,
            TabTitles.HISTORY_TITLE,
            BrowserConsts.HISTORY_URL), true);
    }

    _updateTitle(tab, title, url) {
        super._updateTitle(tab, title);
        if (!this.settings.getPrivateBrowsing()) {
            this.history.updateEntryTitle(url, title);
        }
    }
});

export default HistoryMixin;
export {HistoryMixin};