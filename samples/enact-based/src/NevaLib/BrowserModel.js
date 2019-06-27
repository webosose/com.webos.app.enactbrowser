// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global chrome*/
import {BookmarksMixin} from 'js-browser-lib/BookmarksMixin';
import {BrowserBase, WebViewFactoryBase} from 'js-browser-lib/BrowserBase';
import {BrowserConsts} from 'js-browser-lib/BrowserConsts';
import {IndexedDb} from 'js-browser-lib/IndexedDb';
import {HistoryMixin} from 'js-browser-lib/HistoryMixin';
import {TabTitles, TabTypes} from 'js-browser-lib/TabsConsts';

import Bookmarks from './Bookmarks';
import Config from './Config';
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
            return 'inmemory-partition'; // should be any name without 'persist:' prefix
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
        browser.config = new Config();
        browser.settings = new Settings(store, db, browser);
        browser.prevSessionTabs = undefined;
        browser.recentlyClosed = new RecentlyClosed(store, db, tabsModel);
        browser.mostVisited = new MostVisited(store, db, tabsModel, browser.webViews);
        browser.searchService = new SearchService();
        browser.tabPolicy = undefined;
        browser.devSettingsEnabled = false;
        browser.siteFiltering = new SiteFiltering(this.webViews, tabsModel, db);


        browser.config.initialize(getDefaults().config)
        .then(() => {
            browser.prevSessionTabs = new PreviousSessionTabs(
                browser, db, browser.config.restorePrevSessionPolicy);
            browser.tabPolicy = createTabPolicy(
                tabsModel, browser.webViews, browser.config);
            return db.open(DB_NAME);
        })
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
        if (chrome.app.launchArgs) {
            const launchArgs = JSON.parse(chrome.app.launchArgs);
            if (launchArgs['override_user_agent_string']) {
                this.useragentOverride = launchArgs['override_user_agent_string'];
            }
            if (launchArgs.target) {
                hasTargetInLaunchParams = true;
                this.tabs.addTab(this._createWebViewPage(launchArgs.target));
            }
            if (launchArgs.newtab) {
                hasTargetInLaunchParams = true;
                this.createTab(TabTypes.NEW_TAB_PAGE);
            }
            if (launchArgs.devSettings) {
                this.devSettingsEnabled = true;
            }
        }
        if (!hasTargetInLaunchParams) {
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
            this.tabs.replaceTab(this.tabs.getIndexById(BrowserConsts.SITE_FILTERING_ID), settingsState);
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

    setPrivateBrowsing(usePrivateBrowsing) {
        const {tabs, settings, mostVisited, prevSessionTabs, recentlyClosed} = this;
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
        // Second, we should turn on/off statistics gathering for
        // for prev session tabs, most visited and recently closed
        if (usePrivateBrowsing) {
            mostVisited.turnOff();
            prevSessionTabs.turnOff();
            recentlyClosed.turnOff();
        } else {
            mostVisited.turnOn();
            prevSessionTabs.turnOn();
            recentlyClosed.turnOn();
        }
        // then we can switch mode
        return settings.setPrivateBrowsing(usePrivateBrowsing);
    }

    _createWebViewPage(url) {
        const state = super._createWebViewPage(url);
        // Workaround for WebOS, as browser should show pointer cursor for
        // links but by default it shows normal pointer
        if (this.useragentOverride &&
            (this.useragentOverride.indexOf('WebOS') > -1 ||
             this.useragentOverride.indexOf('Web0S') > -1)) {
            this.webViews[state.id].addContentScripts([{
                name: 'handForLinks',
                matches: ['http://*/*', 'https://*/*'],
                css: { code: 'a:-webkit-any-link { cursor: pointer; }' },
                run_at: 'document_start'
            }]);
        }
        // Support for RCU back key, when focus is on <webview>
        this.webViews[state.id].addContentScripts([{
            name: 'goBackFromRCU',
            matches: ['http://*/*', 'https://*/*'],
            js: { code: `
                document.addEventListener("keydown", ({keyCode}) => {
                    if (keyCode === 0x1CD) {
                        history.back();
                    }
                });
            ` },
            run_at: 'document_start'
        }]);
        return state;
    }
}

export {TabTypes, BrowserConsts, Browser};
