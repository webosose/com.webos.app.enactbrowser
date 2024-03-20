// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {TabTitles, TabTypes} from './TabsConsts';
import {EventEmitter} from './Utilities';

//Helper class to generate 'unique' ids for TabStates
class IdGenerator {
    static _idCounter = 0;
    static getNextId = () => {
        IdGenerator._idCounter++;
        return IdGenerator._idCounter.toString();
    }
}

function diff(base, compared) {
    const result = {};
    let changed = false;
    for (let prop in base) {
        if(base[prop] !== compared[prop]) {
            changed = true;
            result[prop] = compared[prop];
        }
    }
    return changed ? result : null;
}

function updateState(tab) {
    tab.state = tab.tabs.store.getTabs()[tab.state.id];
    return tab.state;
}

class Tab {
    constructor (id, tabs) {
        this.tabs = tabs;
        this.state = tabs.store.getTabs()[id];
    }

    setTitle(title) {
        this.tabs.store.setTitle(this.state.id, title);
        this.tabs.emitEvent('update', {
            state: updateState(this),
            diff: {title}
        });
    }

    setIcon(icon) {
        this.tabs.store.setIcon(this.state.id, icon);
        this.tabs.emitEvent('update', {
            state: updateState(this),
            diff: {icon}
        });
    }

    setError(error) {
        if (this.state.error !== error) {
            this.tabs.store.setError(this.state.id, error);
            this.tabs.emitEvent('update', {
                state: updateState(this),
                diff: {error}
            });
        }
    }

    setNavState(newNavState) {
        const difference = diff(this.state.navState, newNavState);
        if (difference) {
            this.tabs.store.setNavState(this.state.id, newNavState);
            this.tabs.emitEvent('update', {
                state: updateState(this),
                diff: {navState: difference}
            });
        }
    }

    setFinishLoading() {
        this.tabs.emitEvent('update', {
            state: updateState(this),
            diff: {isFinishLoading: true},
        });
    }

    setAuthDialog(authDialog) {
        if (this.state.authDialog !== authDialog) {
            this.tabs.store.setAuthDialog(this.state.id, authDialog);
            this.tabs.emitEvent('update', {
                state: updateState(this),
                diff: {authDialog}
            });
        }
    }

    setPopupState(popupState) {
        if (this.state.popupState !== popupState) {
            this.tabs.store.setPopupState(this.state.id, popupState);
        }
    }
}

/**
 * onContentDelete is called after deleteTab or tab replace
 * and after addTab, if maxTabs reached
 * (active tab content is removed)
 * class ITabsStore {
 *     add = (tabState, setSelected)
 *     close = (index, newSelectedIndex)
 *     move = (from, to) // if from == selected then to should be selected
 *     replace = (index, newTab)
 *     select = (index)
 *     getSelectedIndex = ()
 *     getIds = () // return [] of tab ids
 *     getTabs = () // return {} of tab states, id is key
 * }
 */
class TabsBase extends EventEmitter {
    constructor (storeImpl, maxTabs = 0) {
        super();
        this.onContentDelete = undefined;
        this.maxTabs = maxTabs;
        this.store = storeImpl;
    }

    // creates new tab if contentId is not exist
    // if max tabs is reached, then replace selected tab
    addTab(tabState, setSelected = true) {
        let index = this.getIndexById(tabState.id);
        if (!this.hasTab(tabState.id)) {
            if (this.count() !== this.maxTabs || this.maxTabs === 0) {
                this.store.add(tabState, setSelected);
                this.emitEvent('add', {state: tabState});
            } else {
                index = this.store.getSelectedIndex();
                const oldState = this.getSelectedTab().state;
                this.store.replace(index, tabState);
                this.emitEvent('replace', {index, state: tabState, oldState});
            }
        }
        if (setSelected) {
            this.selectTab(index);
        }
    }

    deleteTab(index) {
        const contentId = this.getIdByIndex(index);
        const state = this.getTab(contentId).state;
        const idsLength = this.count();

        this.store.close(index);

        let selectedIndex = this.store.getSelectedIndex();
        const tab = this.getTab(this.getIdByIndex(selectedIndex));

        this.emitEvent('delete', {state, index});
        this.emitEvent('select', {selectedIndex, state: tab.state});
        this._callOnContentDelete(contentId);
        console.log(`WVE delete WVE (NEVA-6475)`)
    }

    moveTab(from, to) {
        if (from !== to) {
            this.store.move(from, to);
            this.emitEvent('move', {from, to});
            this.selectTab(to);
        }
    }

    replaceTab(index, newState) {
        const oldId = this.store.getIds()[index];
        if (index < this.count()) {
            const oldState = this.getTab(oldId).state;

            // copy navigation history
            const oldHistory = oldState.navState.history;
            const newHistory = newState.navState.history;
            const tabType = newHistory.entries[newHistory.index];

            // 'newState' is always a newly created webview tab
            // combine history from both tabs

            if (tabType !== 'webview') {
                newState.navState.history.index = 0;
                newState.navState.history.entries = [newHistory.entries[0], oldHistory.entries[0]];
                newState.navState.history.views = [newHistory.views[0], oldHistory.views[0]];
            } else {
                newState.navState.history.index = 1;
                newState.navState.history.entries = [oldHistory.entries[0], newHistory.entries[0]];
                newState.navState.history.views = [oldHistory.views[0], newHistory.views[0]];
            }

            this.store.replace(index, newState);
            this.emitEvent('replace', {index, state: newState, oldState});
            this.emitEvent('delete', {state: oldState});
            // check which pageViews (pageView Ids) should be closed
            const oldIds = oldState.navState.history.views;
            const newIds = newState.navState.history.views;
            const droppedIds = oldIds.filter(e => !newIds.includes(e));
            droppedIds.map(this.onContentDelete);

            console.log(`replaceTab. selected index: ${this.store.getSelectedIndex()}, index: ${index}`);
            console.log(newState);

            if (this.store.getSelectedIndex() === index) {
                this.emitEvent('select', {index, state: newState});
            }
        }
    }

    selectTab(index) {
        this.store.select(index);
        const tab = this.getTab(this.getIdByIndex(index));
        this.emitEvent('select', {index, state: tab.state});
    }

    getTab(id) {
        return new Tab(id, this);
    }

    getSelectedTab() {
        return new Tab(this.getSelectedId(), this);
    }

    getSelectedId() {
        return this.store.getIds()[this.store.getSelectedIndex()];
    }

    getIdByIndex(index) {
        return this.store.getIds()[index];
    }

    getIndexById(contentId) {
        const ids = this.store.getIds();
        for (let i = 0; i < ids.length; i++) {
            if (contentId === ids[i]) {
                return i;
            }
        }
        return ids.length;
    }

    hasTab(contentId) {
        return !!this.store.getTabs()[contentId];
    }

    count() {
        return this.store.getIds().length;
    }

    static createTabState(id, type) {
        return {
            id: id,
            type: type,
            initialType: type,
            navState: {
                canGoBack: false,
                canGoForward: false,
                isLoading: false,
                url: '',
                history: {
                    entries: [type],
                    index: 0,
                    views: []
                },
            },
            title: null,
            icon: null,
            error: null,
            authDialog: null,
            popupState: null,
        };
    }

    _callOnContentDelete(contentId) {
        if (this.onContentDelete) {
            this.onContentDelete(contentId);
        }
    }
}

export default TabsBase;
export {IdGenerator, Tab, TabsBase};
