/*global chrome*/
/*global window*/
/*global document*/
import {getUrlWithPrefix} from './Utilities';
import {BrowserConsts} from './BrowserConsts.js';
import {TabTitles, TabTypes} from './TabsConsts';
import WebView from './WebView.js';
import {IdGenerator, TabsBase as TabsModel} from './TabsBase.js';

// We allways have at least one view
class BrowserBase {
    constructor ({tabsModel, defaultWebviewState = 'activated'}) {
        this.defaultWebviewState = defaultWebviewState;
        this.webViews = {};
        this.zoomFactor = 1;
        window.addEventListener('message', this._handleWebviewMessage);
        this.tabs = tabsModel;
        this.tabs.onContentDelete = this._handleContentDelete;
    }

    initializeTabs() {
        this.tabs.addTab(this._createNewTabPage());
    }

    selectTab(index) {
        this.tabs.selectTab(index);
    }

    createNewTab() {
        this.tabs.addTab(this._createNewTabPage(), true);
    }

    closeTab(index) {
        this.tabs.deleteTab(index);
    }

    moveTab(_from, _to) {
        this.tabs.moveTab(_from, _to);
    }

    getSelectedTabState() {
        return this.tabs.getTab(this.tabs.getSelectedId()).state;
    }

    navigate(userUrl) {
        const
            url = userUrl ? getUrlWithPrefix(userUrl) : 'about:blank',
            {type: tabType, id} = this.getSelectedTabState();
        if (tabType !== TabTypes.WEBVIEW) {
            const newState = this._createWebView(url);
            this.tabs.replaceTab(this.tabs.store.getSelectedIndex(), newState);
        }
        else {
            this.webViews[id].navigate(url);
        }
    }

    reloadStop() {
        const webView = this.webViews[this.tabs.getSelectedId()];
        if (webView) {
            webView.reloadStop();
        }
    }

    back() {
        const webView = this.webViews[this.tabs.getSelectedId()];
        if (webView) {
            webView.back();
        }
    }

    forward() {
        const webView = this.webViews[this.tabs.getSelectedId()];
        if (webView) {
            webView.forward();
        }
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        const tabStates = this.tabs.store.getTabs();
        for (let id in tabStates) {
            let state = tabStates[id];
            if (state.type === TabTypes.WEBVIEW) {
                this.webViews[id].setZoom(Number(zoomFactor));
            }
        }
    }

    shutdown() {
        window.close();
    }

    clearData() {
        const options = {
            since: 0
        };
        const types = {
            appcache: true,
            cache: true,
            cookies: true,
            sessionCookies: true,
            persistentCookies: true,
            fileSystems: true,
            indexedDB: true,
            localStorage: true,
            webSQL: true
        };
        for (let key in this.webViews) {
            return this.webViews[key].clearData(options, types);
        }
        // if reached this place then we don't have tab with webview
        // then creating dummy webview to clear partition storage data
        return new Promise((resolve) => {
            const webView = new WebView({
                url: 'about:blank',
                partition: 'persist:default',
                activeState: 'activated'
            });
            // we can't call webview's methods until it inserted into DOM
            // other way there won't be any effect
            webView.addEventListener('navStateChanged', () => {
                webView.clearData(options, types).then(() => {
                    if (document.body.contains(webView.webView)) {
                        document.body.removeChild(webView.webView);
                    }
                    resolve();
                });
            });
            document.body.appendChild(webView.webView);
        });
    }

    _createWebView(url) {
        let state = TabsModel.createTabState(
            IdGenerator.getNextId(),
            TabTypes.WEBVIEW
        );

        state.navState.url = url ? getUrlWithPrefix(url) : 'about:blank';
        state.title = TabTitles.INITIAL_WEBVIEW_TITLE;

        const obj = this;
        this.webViews[state.id] = new WebView({
            url: state.navState.url,
            onNavStateChanged: (navState) => {
                const tab = obj.tabs.getTab(state.id);
                tab.setNavState(navState);
            },
            // Chromium creates distinct renderer process for each webview with
            // different partition name, but doesn't keep session between tabs.
            // I.e. you have entered login/pass for some website, if you want
            // open this website on another tab, you shoud enter your credentials
            // again.
            // partition: BrowserConsts.WEBVIEW_PARTITION_PREF + state.id,
            partition: 'persist:default',
            onNewTab: this._handleNewTab,
            onLabelScriptInjected: (results) => {
                    this._handleWebviewLabelScriptInjected(state.id, results);
                },
            zoomFactor: this.zoomFactor,
            activeState: this.defaultWebviewState
        });
        return state;
    }

    _createNewTabPage() {
        let state = TabsModel.createTabState(
            IdGenerator.getNextId(),
            TabTypes.NEW_TAB_PAGE
        );
        state.title = TabTitles.NEW_TAB_PAGE_TITLE;
        state.navState.url = BrowserConsts.NEW_TAB_PAGE_URL;
        return state;
    }

    _createManagePage(id, type, title, url) {
        if (!this.tabs.hasTab[id]) {
            let state = TabsModel.createTabState(
                id,
                type
            );
            state.title = title;
            state.navState.url = url;
            return state;
        }
        return this.tabs.states[id];
    }

    // handles new tab request from webView
    _handleNewTab = (ev) => {
        const stateId = this._createWebView(ev.targetUrl);
        const selectTab = ev.windowOpenDisposition === 'new_foreground_tab';
        this.tabs.addTab(stateId, selectTab);
    }

    _handleWebviewMessage = (ev) => {
        if (ev.data) {
            const data = JSON.parse(ev.data);
            if (data.id && data.title) {
                const tab = this.tabs.getTab(data.id);
                let title =
                    data.title !== '[no title]' ?
                    data.title :
                    tab.state.navState.url;
                this._updateTitle(tab, title);
            } else {
                console.warn(
                    'Warning: Expected message from guest to contain {name, title}, but got:',
                    data);
            }
        } else {
            console.warn('Warning: Message from guest contains no data');
        }
    }

    _updateTitle(tab, title) {
        tab.setTitle(title);
    }

    _handleWebviewLabelScriptInjected = (id, results) => {
        if (chrome.runtime.lastError) {
            console.warn('Warning: Failed to inject title.js : ' + chrome.runtime.lastError.message);
        } else if (!results || !results.length) {
            console.warn('Warning: Failed to inject title.js results are empty');
        } else {
            // Send a message to the webView so it can get a reference to
            // the embedder
            const data = {'id': id};
            const webView = this.webViews[id].webView;
            webView.contentWindow.postMessage(JSON.stringify(data), '*');
        }
    }

    _handleContentDelete = (contentId) => {
        delete this.webViews[contentId];
    }

}

export {TabTypes, BrowserBase};
