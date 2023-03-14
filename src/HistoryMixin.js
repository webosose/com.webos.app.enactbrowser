// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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

    clearData() {
        return Promise.all([
            super.clearData(),
            this.history.clearAll()
        ]);
    }

    openHistory() {
        this.tabs.addTab(this._createManagePage(
            BrowserConsts.HISTORY_ID,
            TabTypes.HISTORY,
            TabTitles.HISTORY_TITLE,
            BrowserConsts.HISTORY_URL), true);
    }

    clearByURL(url) {
        return Promise.all([
            this.history.clearByURL(url)
        ]);
    }

    _updateTitle(tab, title) {
        super._updateTitle(tab, title);
        if (!this.settings.getPrivateBrowsing()) {
            this.history.updateEntryTitle(tab.state.navState.url, title);
        }
    }
});

export default HistoryMixin;
export {HistoryMixin};