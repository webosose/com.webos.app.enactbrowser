// Copyright (c) 2018-2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {BookmarksMixin} from 'js-browser-lib/BookmarksMixin';
import {BrowserBase, WebViewFactoryBase} from 'js-browser-lib/BrowserBase';
import {BrowserConsts} from 'js-browser-lib/BrowserConsts';
import {IndexedDb} from 'js-browser-lib/IndexedDb';
import {HistoryMixin} from 'js-browser-lib/HistoryMixin';
import Ipc from 'js-browser-lib/Ipc';
import {TabTitles, TabTypes} from 'js-browser-lib/TabsConsts';

import Bookmarks from './Bookmarks';
import {getDefaults} from './BrowserDefaults'
import History from './History';
import MostVisited from './MostVisited';
import PreviousSessionTabs from './PreviousSessionTabs';
import RecentlyClosed from './RecentlyClosed';
import SearchService from './SearchService';
import {Settings, SettingsConsts} from './Settings';
import SiteFiltering from './SiteFiltering';
import {ReduxTabs as TabsModel} from './Tabs';
import createTabPolicy from './TabPolicyFactory';
import {isWindowReady} from '@enact/core/snapshot';

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
        browser.tabPolicy = undefined;
        browser.devSettingsEnabled = false;
        browser.siteFiltering = new SiteFiltering(this.webViews, tabsModel, db);
        browser.prevSessionTabs = new PreviousSessionTabs(
            browser, db, browser.settings.getRestorePrevSessionPolicy());
        browser.tabPolicy = createTabPolicy(
            tabsModel, browser.webViews, browser.settings);

        this.menuIpc = new Ipc("ipc_menu");
        this.menuIpc.subscribe('click', ({menuItem}) => {
            if (typeof window !== 'undefined') {
                console.log(`menuIpc on click. setFoucus to main window`);
                window.shell.shellWindow.pageView.pageContents.setFocus();
            }
            switch(menuItem) {
                case "history":
                    this.createTab(TabTypes.HISTORY)
                    break;

                case "bookmarks":
                    this.createTab(TabTypes.BOOKMARKS)
                    break;

                case "settings":
                    this.createTab(TabTypes.SETTINGS)
                    break;

                case "devSettings":
                    this.createTab(TabTypes.DEV_SETTINGS)
                    break;
            }
        });

        db.open(DB_NAME)
        .then((dbHasCreated) => {
            if (dbHasCreated) {
                return browser.initializeWithDefaults();
            }
            else {
                return undefined;
            }
        })
        .then(() => {
            browser.siteFiltering.setMode(browser.settings.getSiteFiltering());
            browser.searchService.engine = browser.settings.getSearchEngine();
            browser.setStatisticsGathering(browser.settings.getPrivateBrowsing());
            browser.private_browsing_partition_id = (new Date()).toString();
            browser.initializeTabs();
        });

    }

    initializeWithDefaults() {
        const defaults = getDefaults();
        return Promise.all([
            this.settings.initialize(defaults.settings),
            this.bookmarks.initialize(defaults.bookmarks),
            this.siteFiltering.initialize(defaults.sitefiltering)
        ]);
    }

    initializeTabs() {
        let hasTargetInLaunchParams = false;
        if (isWindowReady()) {
            const launchArgs = window.shell.launchArgs;
            if (launchArgs.target) {
                hasTargetInLaunchParams = true;
                this.tabs.addTab(this._createWebViewPage(launchArgs.target));
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
    }

    createTab(type = TabTypes.NEW_TAB_PAGE, url) {
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

    clearData() {
        return Promise.all([
            super.clearData(),
            this.mostVisited.removeAll(),
            this.recentlyClosed.removeAll()
        ]);
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
        if (usePrivateBrowsing === true) { // start new clean session
            this.private_browsing_partition_id = (new Date()).toString();
        }
        // First, we should close all tabs with <webview>
        for (let i = tabs.count() - 1; i >= 0; i--) {
            const id = tabs.getIdByIndex(i), tabType = tabs.getTab(id).state.type;
            if (tabType === TabTypes.WEBVIEW) {
                this.closeTab(i);
            }
        }
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
