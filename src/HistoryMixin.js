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

    _createWebView(url) {
        const state = super._createWebView(url);

        const browser = this;
        this.webViews[state.id].addEventListener('navStateChanged', (navState) => {
            if (navState.isLoading) {
                browser.history.addEntry(navState.url);
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