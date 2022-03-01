// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/
/*global document*/
import {getUrlWithPrefix, fetchFaviconAsDataUrl} from './Utilities';
import {BrowserConsts} from './BrowserConsts.js';
import {TabTitles, TabTypes} from './TabsConsts';
import WebView from './WebView.js';
import {IdGenerator, TabsBase as TabsModel} from './TabsBase.js';

class WebViewFactoryBase {
    constructor(browser) {
        this.browser = browser;
    }

    getPartition() {
        // Chromium creates distinct renderer process for each webview with
        // different partition name, but doesn't keep session between tabs.
        // I.e. you have entered login/pass for some website, if you want
        // open this website on another tab, you shoud enter your credentials
        // again.
        return 'persist:default';
    }

    getState({newWindow}) {
        // Hack to fix advertisement self closing popunder tabs
        return newWindow ? 'activated' : this.browser.defaultWebviewState;
    }

    getUrl({newWindow, url}) {
        return !newWindow ? getUrlWithPrefix(url) : null;
    }

    getUserAgentOverride() {
        return this.browser.useragentOverride;
    }

    getZoomFactor() {
        return this.browser.zoomFactor;
    }

    create(props) {
        return new WebView({
            partition: this.getPartition(props),
            url: this.getUrl(props),
            zoomFactor: this.getZoomFactor(props),
            activeState: this.getState(props),
            useragentOverride: this.getUserAgentOverride(props),
            newWindow: props.newWindow
        });
    }
}

// We allways have at least one view
class BrowserBase {
    constructor ({tabsModel, defaultWebviewState = 'activated', webViewFactory}) {
        this.defaultWebviewState = defaultWebviewState;
        this.webViewFactory = webViewFactory || new WebViewFactoryBase(this);
        this.webViews = [];
        this.zoomFactor = 1;
        this.useragentOverride = null;
        this.tabs = tabsModel;
        this.tabs.onContentDelete = this._handleContentDelete;
        this.tabs.addEventListener('update', this._handleTabsStateUpdate);
    }

    showMenuAbove(id) {
        console.log(`show browser menu`);
        let container_div = document.getElementById(id).parentElement; // popup decorator
        let r = container_div.getBoundingClientRect();
        console.log(`nevaBrowserMenu set position(x:${r.x}, y:${r.y})`);
        console.log(`nevaBrowserMenu set size(width:${r.width}, height:${r.height})`);
        this.menuPopupView.setBounds(Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height));
        this.menuPopupView.setVisible(true);
        this.menuPopupView.bringToFront();
    }

    createMenu() {
        console.log(`create browser menu`);
        if (!this.menuPopupView) {
            this.menuPopupView = new PageView;
        }
        window.shell.shellWindow.pageView.addChildView(this.menuPopupView);
        this.menuPopupView.pageContents.loadURL("http://google.com");
    }

    hideMenu() {
        console.log(`hide browser menu`);
        if (this.menuPopupView) {
            window.shell.shellWindow.pageView.removeChildView(this.menuPopupView);
        }
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
        if (this.tabs.count() !== 1) {
            this.tabs.deleteTab(index);
        } else {
            this.tabs.replaceTab(index, this._createNewTabPage());
        }
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
        const newState = this._createWebViewPage(url);
        if (tabType !== TabTypes.WEBVIEW) {
            this.tabs.replaceTab(this.tabs.store.getSelectedIndex(), newState);
        }
        else {
            this.webViews[id].navigate(url);
            this.webViews[id].tabFamilyId = newState;
        }
    }

    reloadStop() {
        const
            {id, navState: {isLoading}} = this.getSelectedTabState(),
            webView = this.webViews[this.tabs.getSelectedId()];
        if (isLoading) {
            webView.stop();
        }
        else {
            const event = new CustomEvent('navigate', {
                detail: {
                  call_after_render: () => webView.reload()
                }
            });
            webView.dispatchEvent(event);
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
            webView.addEventListener('did-start-loading', () => {
                webView.clearData(options, types).then(() => {
                    if (document.body.contains(webView)) {
                        document.body.removeChild(webView);
                    }
                    resolve();
                });
            });
            document.body.appendChild(webView);
        });
    }

    _createWebViewPage(url, newWindow = null, tab_family_id = null) {
        let state = TabsModel.createTabState(
            IdGenerator.getNextId(),
            TabTypes.WEBVIEW
        );

        state.navState.url = url ? '' : 'about:blank';
        state.title = url;

        const webview = this.webViews[state.id] = this.webViewFactory.create({
            url, newWindow
        });

        webview.tabFamilyId = tab_family_id !== null ? tab_family_id : state.id;
        console.log(`created webview.tabFamilyId = ${webview.tabFamilyId}`);

        webview.addEventListener('did-start-loading', (ev) => this._handleLoadStart(state.id, ev));
        webview.addEventListener('load-progress-changed', (ev) => this._handleLoadCommit(state.id, ev));
        webview.addEventListener('contentload', () => this._handleContentLoad(state.id));
        webview.addEventListener('did-stop-loading', () => this._handleLoadStop(state.id));
        webview.addEventListener('did-finish-load', () => this._handleLoadStop(state.id));
        webview.addEventListener('newwindow', this._handleNewWindow);

        webview.addEventListener('did-fail-load', (ev) => {
            if (ev.isTopLevel) {
                const {reason} = ev;
                const isError =
                    reason !== 'ERR_ABORTED' &&
                    webview.activeState !== 'deactivated';
                if (isError) {
                    const tab = this.tabs.getTab(state.id);
                    tab.setError(reason);
                }
            }
        });
        webview.addEventListener('titlechange', (ev) => {
            const tab = this.tabs.getTab(state.id);
            this._updateTitle(tab, ev.detail.title);
        });
        webview.addEventListener('iconchange', (ev) => {
            fetchFaviconAsDataUrl(ev.detail.favicons, ev.detail.rootUrl)
                .then((dataUrl) => {
                    this.tabs.getTab(state.id).setIcon(dataUrl);
                });
        });
        // This code overrides webview's behavior of reseting zoom on navigation
        webview.addEventListener('zoomchange', (ev) => {
            if (ev.newZoomFactor !== this.zoomFactor) {
                webview.setZoom(this.zoomFactor);
            }
        });
        webview.addEventListener('close', () => {
            this.closeTab(this.tabs.getIndexById(state.id));
        });
        webview.addEventListener('exit', () => {
            const tab = this.tabs.getTab(state.id);
            // TODO: should reason 'normal' be considered?
            tab.setError('RENDERER_CRASHED');
        });
        webview.addEventListener('responsive', () => {
            this.tabs.getTab(state.id).setError(null);
        });
        webview.addEventListener('unresponsive', () => {
            this.tabs.getTab(state.id).setError('PAGE_UNRESPONSIVE');
        });
        webview.addEventListener('permissionrequest', this._handlePermissionRequest);

        console.log(`WVE Authentication dialog event listener (NEVA-6204)`);

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
    _handleNewWindow = (ev) => {
        if (this.tabs.maxTabs === this.tabs.count() &&
            this.tabs.maxTabs !== 0) {
            ev.window.discard();
            return;
        }

        let tab_id = this.tabs.getSelectedId();
        let tab_family_id = null;

        if (this.webViews[tab_id].tabFamilyId === null) {
            this.webViews[tab_id].tabFamilyId = tab_id;
            tab_family_id = tab_id;
        } else {
            tab_family_id = this.webViews[tab_id].tabFamilyId;
        }

        let selectNewTab = false;
        switch (ev.windowOpenDisposition) {
            case 'new_foreground_tab':
                selectNewTab = true;
            case 'new_background_tab':
                const state = this._createWebViewPage(ev.targetUrl, ev.window,
                                                      tab_family_id);
                this.tabs.addTab(state, selectNewTab);
                break;
            case 'new_popup': {
                const state = this._createWebViewPage(ev.targetUrl, ev.window,
                                                      tab_family_id);
                this.tabs.addTab(state, true);
                break;
            }
            default:
                console.warn('New window request ' + ev.windowOpenDisposition + ' is discarded');
                ev.window.discard();
        }
    }

    _updateTitle(tab, title) {
        tab.setTitle(title);
    }

    _handleContentDelete = (contentId) => {
        if (this.webViews[contentId]) {
            this.webViews[contentId].beforeWebviewDelete();
            delete this.webViews[contentId];
        }
    }

    _handlePermissionRequest = (ev) => {
        switch (ev.permission) {
            case 'fullscreen':
                ev.request.allow();
                break;
            case 'media':
                ev.request.allow();
                break;
            default:
                console.warn("Permission request recieved: " + ev.permission);
                ev.request.deny();
        }
    }

    _handleAuthRequired = (tabId, callback) => {
        const tab = this.tabs.getTab(tabId).setAuthDialog({
            signIn: (username, password) => {
                callback({
                    authCredentials: {
                        username,
                        password
                    }
                });
                this.tabs.getTab(tabId).setAuthDialog(null);
            },
            cancel: () => {
                callback();
                this.tabs.getTab(tabId).setAuthDialog(null);
            }
        });
    }

    _handleLoadStart = (tabId) => {
        const
            url = this.webViews[tabId].url,
            tab = this.tabs.getTab(tabId),
            navState = Object.assign({}, tab.state.navState);

        let titleIconChange = false;
        if (navState.url !== url) {
            titleIconChange = true;
        }

        navState.url = url;
        navState.isLoading = true;

        tab.setNavState(navState);

        if (titleIconChange) {
            tab.setTitle(url);
            tab.setIcon(null);
        }
    }

    _handleLoadCommit = (tabId, ev) => {
        const
            tab = this.tabs.getTab(tabId),
            navState = Object.assign({}, tab.state.navState);
        if (navState.url !== ev.url) {
            navState.url = ev.url;
            tab.setNavState(navState);
        }
    }

    _handleContentLoad = (tabId) => {
        const
            tab = this.tabs.getTab(tabId),
            navState = Object.assign({}, tab.state.navState, {
                canGoBack: this.webViews[tabId].canGoBack(),
                canGoForward: this.webViews[tabId].canGoForward()
            });
        tab.setNavState(navState);
    }

    _handleLoadStop = (tabId) => {
        const tab = this.tabs.getTab(tabId);
        if (tab.state) {
            const navState = Object.assign({}, tab.state.navState, {
                isLoading: false,
                canGoBack: this.webViews[tabId].canGoBack(),
                canGoForward: this.webViews[tabId].canGoForward()
            });
            tab.setNavState(navState);
        }
    }

    _handleTabsStateUpdate = (ev) => {
        if ('navState' in ev.diff) {
            const
                id = ev.state.id,
                tab = this.tabs.getTab(id);
            if (tab.state.error && !this.webViews[id].isAborted) {
                tab.setError(null);
            }
        }
    }

}

export {TabTypes, BrowserBase, WebViewFactoryBase};
