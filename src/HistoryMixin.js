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
    }

    clearData() {
        return Promise.all([
            super.clearData(),
            this.history.clearAll()
        ]);
    }

    _createWebView(url, window) {
        const state = super._createWebView(url, window);

        this.webViews[state.id].addEventListener('navstatechanged', (ev) => {
            if (ev.detail.isLoading) {
                this.history.addEntry(ev.detail.url);
            }
        });

        return state;
    }

    _updateTitle(tab, title) {
        super._updateTitle(tab, title);
        this.history.updateEntryTitle(tab.state.navState.url, title);
    }

    openHistory() {
        this.tabs.addTab(this._createManagePage(
            BrowserConsts.HISTORY_ID,
            TabTypes.HISTORY,
            TabTitles.HISTORY_TITLE,
            BrowserConsts.HISTORY_URL), true);
    }
});

export default HistoryMixin;
export {HistoryMixin};