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
        this.store.dispatch(updateTabState(id, {title: title}));
    }

    setIcon = (id, icon) => {
        this.store.dispatch(updateTabState(id, {icon: icon}));
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
