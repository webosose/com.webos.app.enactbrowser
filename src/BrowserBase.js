// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/
/*global document*/
/*global ShellIpc*/
import {getUrlWithPrefix, fetchFaviconAsDataUrl} from './Utilities';
import {BrowserConsts} from './BrowserConsts.js';
import Ipc from './Ipc';
import { isWindowReady } from '@enact/core/snapshot';
import {TabTitles, TabTypes} from './TabsConsts';
import WebView from './WebView.js';
import {IdGenerator, TabsBase as TabsModel} from './TabsBase.js';
import initLogging from './Logger';

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
        return '';
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
        this.useragentOverride = null;
        this.tabs = tabsModel;
        this.tabs.onContentDelete = this._handleContentDelete;
        this.tabs.addEventListener('update', this._handleTabsStateUpdate);

        if (typeof window !== 'undefined' && typeof window.neva !== 'undefined') {
            this.ipc = new Ipc("ipc_chrome_extensions");
            this.ipc.subscribe('click', (extensionInfo) => {
                let webView = this.webViews[this.tabs.getSelectedId()];
                if (webView) {
                    console.log(`window.neva.selectExtension(${webView.getPageContentsId()}, ${extensionInfo.id})`);
                    window.neva.selectExtension(webView.getPageContentsId(), extensionInfo.id);
                }
            });
        }

        if (isWindowReady()) {
            this.zoomControlIpc = new ShellIpc('ipc_ZoomControl');
            this.zoomControlIpc.on('change', ({zoomFactor}) => {
                console.log(`got zoom factor change ${zoomFactor} from zoom menu`);
                this.setZoom(zoomFactor);
            });
        }

        this.browserBaseIpc = new ShellIpc('ipc_browser_base');
        this.browserBaseIpc.on('closeCurrentTab', () => {
            console.log(`BrowserBase:: close current tab ${this.tabs.count()}`);
            this.closeTab(this.tabs.getIndexById(this.tabs.getSelectedId()));
        });
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

    isWebViewTabSelected() {
        const history = this.getSelectedTabState().navState.history;
        const type = history.entries[history.index];
        return (type === TabTypes.WEBVIEW);
    }

    navigate(userUrl) {
        console.log(`[BrowserBase] navigate: ${userUrl}`);
        const url = userUrl ? getUrlWithPrefix(userUrl) : 'about:blank';

        const history = this.getSelectedTabState().navState.history;
        const type = history.entries[history.index];

        if (type !== TabTypes.WEBVIEW) {
            const oldState = this.tabs.getTab(this.tabs.getSelectedId()).state;
            if (oldState.navState.history.views[1] !== undefined) {
                const viewId = oldState.navState.history.views[1];
                this.webViews[viewId].delete();
            }
            const newState = this._createWebViewPage(url);
            this.tabs.replaceTab(this.tabs.store.getSelectedIndex(), newState);
        }
        else {
            const id = history.views[history.index];
            this.webViews[id].navigate(url);
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
            webView.reload();
        }
    }

    back() {
        console.log(`BrowserBase::back`);
        const {navState: {history}, navState} = this.getSelectedTabState();
        console.log(history);

        const webView = this.webViews[history.views[history.index]];

        if (webView.canGoBack === true) {
            webView.back();
        } else {
            //update state
            let tabId = this.tabs.getSelectedId();
            const newNavState = Object.assign({}, navState, {
                history: {
                    index: 0,
                    entries: navState.history.entries,
                    views: navState.history.views
                },
                canGoBack: false,
                canGoForward: true,
                url: ""
            });
            this.tabs.getTab(this.tabs.getSelectedId()).setNavState(newNavState);
            webView.suspend();
        }
    }

    forward() {
        console.log(`BrowserBase::forward`);
        const {navState: {history}, navState} = this.getSelectedTabState();

        const webView = this.webViews[history.views[1]];

        if (history.index === 0) {
            // updated state
            const newNavState = Object.assign({}, navState, {
                history: {
                    index: 1,
                    entries: navState.history.entries,
                    views: navState.history.views
                },
                canGoBack: true,
                canGoForward: webView.canGoForward,
                url: webView.url
            });
            this.tabs.getTab(this.tabs.getSelectedId()).setNavState(newNavState);
            webView.activate();
        } else {
            webView.forward();
        }
    }

    getZoom() {
        const {navState: {history}} = this.getSelectedTabState();
        const webView = this.webViews[history.views[1]];
        return webView.getZoom();
    }

    setZoom(zoomFactor) {
        console.log(`BrowserBase::setZoom`);
        const {navState: {history}} = this.getSelectedTabState();
        this.webViews[history.views[1]].setZoom(zoomFactor);
    }

    sendZoomFactorToZoomMenu() {
        console.log(`BrowserBase::sendZoomFactorToZoomMenu`);
        if (this.isWebViewTabSelected()) {
            const {navState: {history}} = this.getSelectedTabState();
            const zoomFactor = this.webViews[history.views[1]].getZoom();
            this.zoomControlIpc.post('zoomChange', {zoomFactor: zoomFactor});
        }
    }

    shutdown() {
        window.close();
    }

    clearData(partitionId) {
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

        let dummyView = new PageView({"page-contents-params": {"partition":partitionId}});
        shell.shellWindow.pageView.addChildView(dummyView);
        dummyView.setBounds(0, 0, 10, 10);
        dummyView.setVisible(false);
        dummyView.pageContents.on('did-start-loading', () => {
            dummyView.pageContents.clearData(options, types);
            shell.shellWindow.pageView.removeChildView(dummyView);
            console.log(`clearData ${partitionId}`);
            dummyView.pageContents.closeNow();
        })
        dummyView.pageContents.loadURL('about:blank');
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

        state.navState.history.views[state.navState.history.index] = state.id;

        webview.addEventListener('did-start-loading', (ev) => this._handleLoadStart(state.id, ev));
        webview.addEventListener('contentload', () => this._handleContentLoad(state.id));
        webview.addEventListener('did-stop-loading', () => this._handleLoadStop(state.id));
        webview.addEventListener('did-finish-load', this._handleFinishLoading(state.id));
        webview.addEventListener('newwindow', this._handleNewWindow(state.id));
        webview.addEventListener('did-update-favicon-url', this._handleUpdateFaviconUrl(state.id, webview));
        webview.addEventListener('open-url-from-tab', this._handleOpenUrlFromTab(state.id));

        webview.addEventListener('did-fail-load', (url, error, code) => {
            const isError =
                error !== 'ERR_ABORTED' &&
                webview.activeState !== 'deactivated';
            if (isError) {
                const tab = this.tabs.getTab(state.id);
                tab.setError(error);
            }
        });
        webview.addEventListener('page-title-updated', (title) => {
            console.log(`page title updated event: ${title}`);
            const tab = this.tabs.getTab(state.id);
            this._updateTitle(tab, title);
        });
        webview.addEventListener('zoomchange', (newZoomFactor) => {
            if (newZoomFactor !== this.getZoom()) {
                this.setZoom(newZoomFactor);
                this.sendZoomFactorToZoomMenu();
            }
        });
        webview.addEventListener('close', () => {
            this.closeTab(this.tabs.getIndexById(state.id));
        });
        webview.addEventListener('exit', (reason) => {
            console.log(`exit event ${reason}`);
            const tab = this.tabs.getTab(state.id);
            if (reason !== 'normal') {
                tab.setError('RENDERER_CRASHED');
            }
        });
        webview.addEventListener('responsive', () => {
            this.tabs.getTab(state.id).setError(null);
        });
        webview.addEventListener('unresponsive', () => {
            this.tabs.getTab(state.id).setError('PAGE_UNRESPONSIVE');
        });
        webview.addEventListener('permissionrequest', this._handlePermissionRequest);

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

    _handleUpdateFaviconUrl = (tabId, webview) => (favicons) => {
        // favicons => [{url, type, sizes}, ...]
        console.log(`did-update-favicon-url event occured`);

        const origin_regexp = /.*?:\/\/.*?\//;
        const result = origin_regexp.exec(webview.url);
        const rootUrl = result && result[0] ? result[0] : '';
        const tab = this.tabs.getTab(tabId);

        fetchFaviconAsDataUrl(favicons, rootUrl)
        .then((dataUrl) => {
            tab.setIcon(dataUrl);
            const navState = Object.assign({}, tab.state.navState, {
                isLoading: false,
            });
            tab.setNavState(navState);
        });
    };

    // handles new tab request from webView
    _handleNewWindow = (contentId) => (childPage, info) => {
        const view = this.webViews[contentId];
        console.log(`newwindow event (${view.webContentHasLoaded})`);
        console.log(info);
        if (this.tabs.maxTabs === this.tabs.count() &&
            this.tabs.maxTabs !== 0) {
            console.log(`cancel newwindow request (max tabs)`);
            return;
        }

        if (!view.webContentHasLoaded) {
            console.log(`cancel newwindow request (web content was not loaded yet)`);
            childPage.closeNow();
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
        switch (info.windowOpenDisposition) {
            case 'new_foreground_tab':
                selectNewTab = true;
            case 'new_background_tab':
                const state = this._createWebViewPage(info.targetUrl, childPage,
                                                      tab_family_id);
                this.tabs.addTab(state, selectNewTab);
                break;
            case 'new_window':
            case 'new_popup': {
                const state = this._createWebViewPage(info.targetUrl, childPage,
                                                      tab_family_id);
                this.tabs.addTab(state, true);
                break;
            }
            default:
                console.warn('New window request ' + info.windowOpenDisposition + ' is discarded');
        }
    }

    _handleOpenUrlFromTab = (contentId) => (info) => this._handleNewWindow(contentId)(null, info);

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

        let titleChange = false;
        if (navState.url !== url) {
            titleChange = true;
        }

        navState.url = url;
        navState.isLoading = true;

        tab.setNavState(navState);

        if (titleChange) {
            tab.setTitle(url);
        }
    }

    _canGoBack = (tabId) => {
        const tab = this.tabs.getTab(tabId);
        console.log(tab);
        return (this.webViews[tabId].canGoBack
                || tab.state.navState.history.index !== 0);
    }

    _canGoForward = (tabId) => {
        const tab = this.tabs.getTab(tabId);
        const history = tab.state.navState.history;
        console.log(tab);

        if (history.index === 0) {
            if (history.views[1] !== undefined) {
                return true;
            }
        } else {
            return this.webViews[tabId].canGoBack;
        }
        return false;
    }

    _handleContentLoad = (tabId) => {
        console.log(`BrowserBase::_handleLoadStart`);

        const
        tab = this.tabs.getTab(tabId),
        navState = Object.assign({}, tab.state.navState, {
            canGoBack: this._canGoBack(tabId),
            canGoForward: this.webViews[tabId].canGoForward
        });
        tab.setNavState(navState);
    }

    _handleFinishLoading = (tabId) => (url) => {
        console.log(`BrowserBase::_handleFinishLoading ${url}`);
        const tab = this.tabs.getTab(tabId);

        if (tab.state) {
            const navState = Object.assign({}, tab.state.navState, {
                canGoBack: this._canGoBack(tabId),
                canGoForward: this.webViews[tabId].canGoForward,
                url: url
            });
            tab.setNavState(navState);
            this.webViews[tabId].emit('needToUpdateUI');
        }
    }

    _handleLoadStop = (tabId) => {
        console.log(`BrowserBase::_handleLoadStop`);
        const tab = this.tabs.getTab(tabId);
        const isLoading = tab.state.icon ? false : true;

        if (tab.state) {
            const navState = Object.assign({}, tab.state.navState, {
                isLoading: isLoading,
                canGoBack: this._canGoBack(tabId),
                canGoForward: this.webViews[tabId].canGoForward
            });
            tab.setNavState(navState);
            this.webViews[tabId].emit('needToUpdateUI');

            if (isLoading) {
                // There is no constant sequence of 'did-stop-loading' and 'did-update-favicon-url'
                // events coming.
                // Lets wait a bit if favicon is not still provided. And then stop loading indication.
                console.log(`Stop loading indication by timeout`);
                setTimeout(() => {
                    tab.setNavState(Object.assign({}, tab.state.navState, {
                        isLoading: false
                    }));
                }, 1000);
            }
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
