// Copyright 2018 LG Electronics, Inc.
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

import {BookmarksMixin} from './bookmarks-mixin';
import {BrowserBase, WebViewFactoryBase} from './browser-base';
import {BrowserConsts} from './browser-consts';
import {IndexedDb} from './indexed-db';
import {HistoryMixin} from './history-mixin';
import Ipc from './ipc';
import {TabTitles, TabTypes} from './tabs-consts';
import {createTabPolicy} from './memory-manager/tab-policy-factory';

import Bookmarks from './ReduxComponents/Bookmarks/Bookmarks';
import {getDefaults} from './BrowserDefaults'
import History from './ReduxComponents/History/History';
import MostVisited from './MostVisited';
import PreviousSessionTabs from './PreviousSessionTabs';
import RecentlyClosed from './RecentlyClosed';
import SearchService from './SearchService';
import {Settings, SettingsConsts, SettingsKeys} from './ReduxComponents/Settings/Settings';
import SiteFiltering from './ReduxComponents/SiteFiltering/SiteFiltering';
import {ReduxTabs as TabsModel} from './ReduxComponents/Tabs/Tabs';
import {isWindowReady} from '@enact/core/snapshot';
import CookieManager from './CookieManager';
import CustomUserAgent from './CustomUserAgent';
import PopupBlocker from './PopupBlocker';

Object.assign(TabTitles, {
    SITE_FILTERING_TITLE: 'Site Filtering',
    DEV_SETTINGS_TITLE: 'Developer Settings'
});

Object.assign(TabTypes, {
    DEV_SETTINGS: 'devSettings'
});

Object.assign(BrowserConsts, {
    SITE_FILTERING_URL: 'site-filtering',
    SITE_FILTERING_ID: 'sitefiltering',
    DEV_SETTINGS_ID: 'devsettings',
    DEV_SETTINGS_URL: 'dev-settings'
});

const DB_NAME = 'BrowserPersistent';

class WebViewFactory extends WebViewFactoryBase {
    constructor(browser) {
        super(browser);
    }

    getPartition() {
        if (this.browser.settings.getPrivateBrowsing()) {
            return this.browser.private_browsing_partition_id;
        } else {
            return super.getPartition();
        }
    }
}

// We allways have at least one view
class Browser extends BookmarksMixin(HistoryMixin(BrowserBase)) {
    constructor (store, maxTabs) {
        const
            db = new IndexedDb(),
            tabsModel = new TabsModel(store, maxTabs),
            history = new History(store, db),
            bookmarks = new Bookmarks(store, db);
        super({
            bookmarks,
            history,
            tabsModel,
            defaultWebviewState: 'deactivated',
            webViewFactory: new WebViewFactory(null)
        });

        const browser = this;
        browser.webViewFactory.browser = browser;
        browser.settings = new Settings(store, db, browser);
        browser.prevSessionTabs = undefined;
        browser.recentlyClosed = new RecentlyClosed(store, db, tabsModel);
        browser.mostVisited = new MostVisited(store, db, tabsModel, browser.webViews);
        browser.searchService = new SearchService();
        browser.cookieManager = new CookieManager();
        browser.customUserAgent = new CustomUserAgent(db, this.getNavigatorCustomUserAgent());
        browser.tabPolicy = undefined;
        browser.devSettingsEnabled = false;
        browser.popupBlocker = new PopupBlocker();
        browser.prevSessionTabs = new PreviousSessionTabs(
            browser, db, browser.settings.getRestorePrevSessionPolicy());
        browser.tabPolicy = createTabPolicy(
            tabsModel, browser.webViews, browser.settings);

        const navSiteFilter = this.getNavigatorSiteFilter();
        if (typeof navSiteFilter !== 'undefined') {
            browser.siteFiltering = new SiteFiltering(store, this.getNavigatorSiteFilter());
        }

        this.menuIpc = new Ipc("ipc_menu");
        this.menuIpc.subscribe('click', ({menuItem}) => {
            if (typeof window !== 'undefined') {
                console.log(`menuIpc on click. setFoucus to main window`);
                window.shell.shellWindow.pageView.pageContents.setFocus();
            }
            switch(menuItem) {
                case "history":
                    this.createTab(TabTypes.HISTORY);
                    break;

                case "bookmarks":
                    this.createTab(TabTypes.BOOKMARKS);
                    break;

                case "settings":
                    this.createTab(TabTypes.SETTINGS);
                    break;

                case "devSettings":
                    this.createTab(TabTypes.DEV_SETTINGS);
                    break;
            }
        });

        this.browserLoadingPromise = db.open(DB_NAME)
        .then((dbHasCreated) => {
            if (dbHasCreated) {
                return browser.initializeWithDefaults();
            }
            else {
                return undefined;
            }
        })
        .then(() => {
            if (typeof browser.siteFiltering !== 'undefined') {
                browser.siteFiltering.setMode(browser.settings.getSiteFiltering());
            }
            browser.searchService.engine = browser.settings.getSearchEngine();
            browser.customUserAgent.fetchUserAgents();
            browser.setStatisticsGathering(browser.settings.getPrivateBrowsing());
            browser.private_browsing_partition_id = "private";
            browser.initializeTabs();
        })
        .then(() => {
            this.initializeExtenionAPI();
        });
    }

    setExtensionButtonRef(ref) {
        this.extensionButtonRef = ref;
    }

    initializeExtenionAPI() {
        if (typeof window !== 'undefined' && typeof window.nevaExtensionsManager !== 'undefined'){
            let extensionsService = window.nevaExtensionsManager.getExtensionsServiceFor(this.webViewFactory.getPartition());
            console.log("Add create-extension-tab event");
            extensionsService.addEventListener("create-extension-tab", (request_id) => {
                console.log("create-extension-tab event occured");
                this.createTab(TabTypes.WEBVIEW, "");
                let webView = this.webViews[this.tabs.getSelectedId()];
                if (webView) {
                    console.log("webview created");
                    extensionsService.extensionTabCreated(request_id, webView.getPageContentsId());
                } else {
                    console.error("No webview found");
                }
            });

            extensionsService.addEventListener("close-extension-tab", (tab_id) => {
                console.log("close-extension-tab event occured");
                const {tabs} = this;
                for (let i = tabs.count() - 1; i >= 0; i--) {
                    let webView = this.webViews[tabs.getIdByIndex(i)];
                    if (webView.getPageContentsId() === tab_id) {
                        this.closeTab(i);
                        return;
                    }
                }
            });

            extensionsService.addEventListener("focus-extension-tab", (tab_id) => {
                console.log("focus-extension-tab event occured");
                const {tabs} = this;
                for (let i = tabs.count() - 1; i >= 0; i--) {
                    let webView = this.webViews[tabs.getIdByIndex(i)];
                    if (webView.getPageContentsId() === tab_id) {
                        this.selectTab(i);
                        return;
                    }
                }
            });

            extensionsService.addEventListener("create-extension-popup", () => {
                console.log("create-extension-popup event occured");
                let popupView = new window.PageView({"page-contents-params": {
                  "partition": this.webViewFactory.getPartition(),
                  "page-contents-type": "ui"
                }});
                window.shell.shellWindow.pageView.addChildView(popupView);
                let webView = this.webViews[this.tabs.getSelectedId()];
                extensionsService.extensionPopupViewCreated(popupView.id, webView.getPageContentsId());
                window.extensionPopupView = popupView;

                window.document.addEventListener('click', () => {
                    if (window.extensionPopupView) {
                        window.shell.shellWindow.pageView.removeChildView(window.extensionPopupView);
                        window.extensionPopupView.setVisible(false);
                    }
                    window.extensionPopupView = undefined;
                }, { once: true });

                const button = this.extensionButtonRef.current;
                const buttonHeight = button.offsetHeight + 20;
                const leftBorderWidth =  Math.round((document.body.clientWidth / 100) * 70);
                const width = document.body.clientWidth - leftBorderWidth;

                popupView.setBounds(leftBorderWidth, buttonHeight, width, 200);

                popupView.pageContents.setFocus();
                popupView.setVisible(true);
            });

            extensionsService.addEventListener("close-extension-popup", (popup_view_id) => {
                console.log("close-extension-popup event occured");
                if (window.extensionPopupView && window.extensionPopupView.id === popup_view_id) {
                    window.shell.shellWindow.pageView.removeChildView(window.extensionPopupView);
                    window.extensionPopupView.setVisible(false);
                }
                window.extensionPopupView = undefined;
            });

            extensionsService.addEventListener("update-extension-popup", (popup_view_id, width, height) => {
                console.log("update-extension-popup event occured");
                if (window.extensionPopupView && window.extensionPopupView.id === popup_view_id) {
                    const left =  document.body.clientWidth - width;
                    const button = this.extensionButtonRef.current;
                    const buttonHeight = button.offsetHeight + 20;
                    window.extensionPopupView.setBounds(left, buttonHeight, width, height);
                }
            });
        }
    }

    initializeWithDefaults() {
        const defaults = getDefaults();
        return Promise.all([
            this.settings.initialize(defaults.settings),
            this.bookmarks.initialize(defaults.bookmarks),
        ]);
    }

    initializeTabs() {
        let hasTargetInLaunchParams = false;
        this.clearData("private").then(() => {
            if (isWindowReady()) {
                const launchArgs = window.shell.launchArgs;
                if (launchArgs['user-agent']) {
                    console.log(`UA string: ${launchArgs['user-agent']}`);
                    this.useragentOverride = launchArgs['user-agent'];
                }
                if (launchArgs.target) {
                    hasTargetInLaunchParams = true;
                    this.tabs.addTab(this._createWebViewPage(launchArgs.target));
                }
                if (launchArgs.uri) {
                    hasTargetInLaunchParams = true;
                    this.tabs.addTab(this._createWebViewPage(launchArgs.uri));
                }
                if (launchArgs.newtab) {
                    hasTargetInLaunchParams = true;
                    this.createTab(TabTypes.NEW_TAB_PAGE);
                }
            }

            if (!hasTargetInLaunchParams) {
                if (this.settings.getPrivateBrowsing()) {
                    this.createTab(TabTypes.NEW_TAB_PAGE);
                } else {
                    const startupPage = this.settings.getStartupPage();
                    if (startupPage === SettingsConsts.NEW_TAB_PAGE) {
                        this.createTab(TabTypes.NEW_TAB_PAGE);
                    } else if (startupPage === SettingsConsts.CONTINUE) {
                        this.prevSessionTabs.restore();
                    } else if (startupPage === SettingsConsts.HOME_PAGE) {
                        this.createTab(TabTypes.WEBVIEW, this.settings.getHomePageUrl());
                    }
                }
            }
        });
    }

    createTab(type = TabTypes.NEW_TAB_PAGE, url = '') {
        switch (type) {
            case TabTypes.WEBVIEW:
                this.tabs.addTab(this._createWebViewPage(url));
                break;
            case TabTypes.NEW_TAB_PAGE:
                this.createNewTab();
                break;
            case TabTypes.SETTINGS:
                this.openSettings();
                break;
            case TabTypes.SITE_FILTERING:
                this.openSiteFiltering();
                break;
            case TabTypes.HISTORY:
                this.openHistory();
                break;
            case TabTypes.BOOKMARKS:
                this.openBookmarks();
                break;
            case TabTypes.DEV_SETTINGS:
                this.openDevSettings();
                break;
            default:
                console.warn('Unknown tab type: ' + type);
        }
    }

    allowPopup(tabId, url) {
        if (this.popupBlocker.addURL(url)) {
            this.tabs.getTab(tabId).setPopupState(null);
        }
    }

    // At now we have only 2 type of partitions and in "private" mode mostVisited,
    // history and recentlyClosed are not fill.
    clearData(partitionId) {
        console.log(`BrowserModel::clearData(${partitionId})`);
        if (partitionId === "private") {
            return Promise.all([
                super.clearData(partitionId),
            ]);
        } else {
            return Promise.all([
                super.clearData(partitionId),
                super.clearAllHistory(),
                this.mostVisited.removeAll(),
                this.recentlyClosed.removeAll()
            ]);
        }
    }

    restoreSettings () {
		const settingsDefault = getDefaults().settings;
        const tasks = [
			this.setPrivateBrowsing(settingsDefault[SettingsKeys.PRIVATE_BROWSING_KEY]),
			this.settings.setAllSettings(settingsDefault),
			this.cookieManager.clearCookies(),
		];
		if (typeof this.siteFiltering !== 'undefined') {
			tasks.push(this.siteFiltering.deleteURLs([], true));
		}
		return Promise.all(tasks);
	}

    openDevSettings() {
        this.tabs.addTab(
            this._createManagePage(
                BrowserConsts.DEV_SETTINGS_ID,
                TabTypes.DEV_SETTINGS,
                TabTitles.DEV_SETTINGS_TITLE,
                BrowserConsts.DEV_SETTINGS_URL
                ),
            true
        );
    }

    openSettings() {
        const settingsState = this._createManagePage(
            BrowserConsts.SETTINGS_ID,
            TabTypes.SETTINGS,
            TabTitles.SETTINGS_TITLE,
            BrowserConsts.SETTINGS_URL);

        if (!this.tabs.hasTab(BrowserConsts.SITE_FILTERING_ID)) {
            this.tabs.addTab(settingsState, true);
        } else {
            const index = this.tabs.getIndexById(BrowserConsts.SITE_FILTERING_ID);
            this.tabs.replaceTab(index, settingsState);
            this.tabs.selectTab(index);
        }
    }

    openSiteFiltering() {
        const index = this.tabs.getIndexById(this.tabs.getSelectedId());
        this.tabs.replaceTab(index, this._createManagePage(
            BrowserConsts.SITE_FILTERING_ID,
            TabTypes.SITE_FILTERING,
            TabTitles.SITE_FILTERING_TITLE,
            BrowserConsts.SITE_FILTERING_URL));
    }

    setStatisticsGathering(usePrivateBrowsing) {
        const {mostVisited, prevSessionTabs, recentlyClosed} = this;
        if (usePrivateBrowsing) {
            mostVisited.turnOff();
            prevSessionTabs.turnOff();
            recentlyClosed.turnOff();
        } else {
            mostVisited.turnOn();
            prevSessionTabs.turnOn();
            recentlyClosed.turnOn();
        }
    }

    getPrivateBrowsing() {
        return this.settings.getPrivateBrowsing();
    }

    setPrivateBrowsing(usePrivateBrowsing) {
        const {tabs, settings} = this;
        if (usePrivateBrowsing === settings.getPrivateBrowsing()) {
            return;
        }
        // First, we should close all tabs with <webview>
        for (let i = tabs.count() - 1; i >= 0; i--) {
            const id = tabs.getIdByIndex(i), tabType = tabs.getTab(id).state.type;
            if (tabType === TabTypes.WEBVIEW) {
                this.closeTab(i);
            }
        }
        this.clearData("private");
        // Second, we should turn on/off statistics gathering for
        // for prev session tabs, most visited and recently closed
        this.setStatisticsGathering(usePrivateBrowsing);
        // then we can switch mode
        return settings.setPrivateBrowsing(usePrivateBrowsing);
    }

    _createWebViewPage(url, windowToAttach = null, tab_family_id = null) {
        const state = super._createWebViewPage(url, windowToAttach, tab_family_id);
        // Workaround for WebOS, as browser should show pointer cursor for
        // links but by default it shows normal pointer
        if (this.useragentOverride &&
            (this.useragentOverride.indexOf('WebOS') > -1 ||
             this.useragentOverride.indexOf('Web0S') > -1)) {
            console.log(`WVE set Hand shaped cursor for links (NEVA-6228)`);
        }
        // Support for RCU back key, when focus is on <webview>
        console.log(`WVE Handle RCU goback key.(NEVA-6413)`);
        return state;
    }
}

export {TabTypes, BrowserConsts, Browser};
