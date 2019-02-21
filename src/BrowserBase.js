// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global chrome*/
/*global window*/
/*global document*/
import {getUrlWithPrefix, fetchFaviconAsDataUrl} from './Utilities';
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
        this.useragentOverride = null;
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
            webView.addEventListener('navstatechanged', () => {
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

    _createWebView(url, newWindow = null) {
        let state = TabsModel.createTabState(
            IdGenerator.getNextId(),
            TabTypes.WEBVIEW
        );

        state.navState.url = url ? getUrlWithPrefix(url) : 'about:blank';
        state.title = url;

        const webview = this.webViews[state.id] = new WebView({
            url: !newWindow ? state.navState.url : null,
            // Chromium creates distinct renderer process for each webview with
            // different partition name, but doesn't keep session between tabs.
            // I.e. you have entered login/pass for some website, if you want
            // open this website on another tab, you shoud enter your credentials
            // again.
            // partition: BrowserConsts.WEBVIEW_PARTITION_PREF + state.id,
            partition: 'persist:default',
            zoomFactor: this.zoomFactor,
            // Hack to fix advertisement self closing bpopunder tabs
            activeState: newWindow ? 'activated' : this.defaultWebviewState,
            useragentOverride: this.useragentOverride,
            newWindow: newWindow
        });
        webview.addEventListener('navstatechanged', (ev) => {
            const tab = this.tabs.getTab(state.id);
            if (tab.state.error && !webview.isAborted) {
                tab.setError(null);
            }
            tab.setNavState(ev.detail);
        });
        webview.addEventListener('newwindow', this._handleNewWindow);
        webview.addEventListener('loadabort', (ev) => {
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
            if (ev.detail.favicons) {
                fetchFaviconAsDataUrl(ev.detail.favicons, ev.detail.rootUrl)
                .then((dataUrl) => {
                    this.tabs.getTab(state.id).setIcon(dataUrl);
                });
            }
            else {
                this.tabs.getTab(state.id).setIcon(null);
            }
        });
        // This code overrides webview's behavior of reseting zoom on navigation
        webview.addEventListener('zoomchange', (ev) => {
            if (ev.newZoomFactor !== this.zoomFactor) {
                webview.setZoom(this.zoomFactor);
            }
        });
        webview.addEventListener('close', () => {
            if (this.tabs.count() !== 1) {
                this.closeTab(this.tabs.getIndexById(state.id));
            }
            else {
                this.tabs.replaceTab(0, this._createNewTabPage());
            }
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

        let selectNewTab = false;
        switch (ev.windowOpenDisposition) {
            case 'new_foreground_tab':
                selectNewTab = true;
            case 'new_background_tab':
                const state = this._createWebView(ev.targetUrl, ev.window);
                this.tabs.addTab(state, selectNewTab);
                break;
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
            default:
                console.warn("Permission request recieved: " + ev.permission);
                ev.request.deny();
        }
    }

}

export {TabTypes, BrowserBase};
