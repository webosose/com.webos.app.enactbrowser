// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

class PreviousTabs {
    constructor(storage, tabs) {
        this.storage = storage;
        this.tabs = tabs;
        this.turnOn();
    }

    get() {
        return this.storage.get();
    }

    reset() {
        return this.storage.reset();
    }

    turnOn() {
        this.tabs.addEventListener('add', this.handleTabAdd);
        this.tabs.addEventListener('update', this.handleTabUpdate);
        this.tabs.addEventListener('delete', this.handleTabDelete);
        this.tabs.addEventListener('move', this.handleTabMove);
        this.tabs.addEventListener('replace', this.handleTabReplace);
    }

    turnOff() {
        this.tabs.removeEventListener('add', this.handleTabAdd);
        this.tabs.removeEventListener('update', this.handleTabUpdate);
        this.tabs.removeEventListener('delete', this.handleTabDelete);
        this.tabs.removeEventListener('move', this.handleTabMove);
        this.tabs.removeEventListener('replace', this.handleTabReplace);
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