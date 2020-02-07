// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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

    handleTabDelete = (ev) => {
        if (ev.state.type === TabTypes.WEBVIEW) {
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
}

export default RecentlyClosedSites;
export {RecentlyClosedSites};
