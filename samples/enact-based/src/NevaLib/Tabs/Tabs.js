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

import {IdGenerator, Tab, TabsBase} from 'js-browser-lib/TabsBase';
import {
    addTab,
    replaceTab,
    closeTab,
    moveTab,
    selectTab,
    updateTabState
} from './actions';

class TabsReduxStore {
    constructor(reduxStore) {
        this.store = reduxStore;
    }

    add = (tabState, setSelected) => {
        this.store.dispatch(addTab(tabState, setSelected));
    }

    close = (index, newSelectedIndex) => {
        this.store.dispatch(closeTab(index, newSelectedIndex));
    }

    move = (from, to) => {
        this.store.dispatch(moveTab(from, to));
    }

    replace = (index, newTabState) => {
        this.store.dispatch(replaceTab(index, newTabState));
    }

    select = (index) => {
        this.store.dispatch(selectTab(index));
    }

    getSelectedIndex = () => {
        return this.store.getState().tabsState.selectedIndex;
    }

    getIds = () => {
        return this.store.getState().tabsState.ids;
    }

    // TODO: rename to getStates?
    getTabs = () => {
        return this.store.getState().tabsState.tabs;
    }

    setTitle = (id, title) => {
        this.store.dispatch(updateTabState(id, {title}));
    }

    setIcon = (id, icon) => {
        this.store.dispatch(updateTabState(id, {icon}));
    }

    setError = (id, error) => {
        this.store.dispatch(updateTabState(id, {error}));
    }

    setNavState = (id, navState) => {
        const newNavState = Object.assign(
            {},
            this.store.getState().tabsState.tabs[id].navState,
            navState
        );
        this.store.dispatch(updateTabState(id, {navState: newNavState}));
    }
}

class ReduxTabs extends TabsBase {
    constructor(reduxStore, maxTabs = 7) {
        super(new TabsReduxStore(reduxStore), maxTabs);
    }
}

export default ReduxTabs;
export {IdGenerator, Tab, ReduxTabs};
