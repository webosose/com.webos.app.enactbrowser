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
    return changed ? result : undefined;
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
        let selectedIndex = this.store.getSelectedIndex();
        const idsLength = this.count();

        this.store.close(index, selectedIndex);
        if (selectedIndex >= index) {
            if (selectedIndex !== 0) {
                selectedIndex--;
            }
            this.selectTab(selectedIndex);
        }

        this.emitEvent('delete', {state, index});
        this._callOnContentDelete(contentId);
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
            this.store.replace(index, newState);
            this.emitEvent('replace', {index, state: newState, oldState});
            this._callOnContentDelete(oldId);
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
        // TODO: create dictionary for this wrappers and hadle it's lifecycle
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
            navState: {
                canGoBack: false,
                canGoForward: false,
                isLoading: false,
                url: ''
            },
            title: null,
            icon: null,
            error: null
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