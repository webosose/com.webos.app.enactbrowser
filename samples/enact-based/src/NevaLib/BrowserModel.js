// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global chrome*/
import {BookmarksMixin} from 'js-browser-lib/BookmarksMixin';
import {BrowserBase} from 'js-browser-lib/BrowserBase';
import {BrowserConsts} from 'js-browser-lib/BrowserConsts';
import {IndexedDb} from 'js-browser-lib/IndexedDb';
import {HistoryMixin} from 'js-browser-lib/HistoryMixin';
import {TabTitles, TabTypes} from 'js-browser-lib/TabsConsts';

import Bookmarks from './Bookmarks';
import Config from './Config';
import History from './History';
import MostVisited from './MostVisited';
import PreviousSessionTabs from './PreviousSessionTabs';
import RecentlyClosed from './RecentlyClosed';
import {ReduxTabs as TabsModel} from './Tabs';
import createTabPolicy from './TabPolicyFactory';
import SearchService from './SearchService';
import {Settings, SettingsConsts} from './Settings';
import {getDefaults} from './BrowserDefaults'

Object.assign(TabTitles, {
    SITE_FILTERING_TITLE: 'Site Filtering'
});

Object.assign(BrowserConsts, {
    SITE_FILTERING_URL: '',
    SITE_FILTERING_ID: 'sitefiltering'
});

const DB_NAME = 'BrowserPersistent';

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
            defaultWebviewState: 'deactivated'
        });

        const browser = this;
        browser.config = new Config();
        browser.settings = new Settings(store, db, browser);
        browser.prevSessionTabs = undefined;
        browser.recentlyClosed = new RecentlyClosed(store, db, tabsModel);
        browser.mostVisited = new MostVisited(store, db, tabsModel, browser.webViews);
        browser.searchService = new SearchService();
        browser.tabPolicy = undefined;


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
            browser.searchService.engine = browser.settings.getSearchEngine();
            browser.initializeTabs();
        });

    }

    initializeWithDefaults() {
        const defaults = getDefaults();
        return Promise.all([
            this.settings.initialize(defaults.settings),
            this.bookmarks.initialize(defaults.bookmarks)
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
                this.tabs.addTab(this._createWebView(launchArgs.target));
            }
            if (launchArgs.newtab) {
                hasTargetInLaunchParams = true;
                this.createTab(TabTypes.NEW_TAB_PAGE);
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
                this.tabs.addTab(this._createWebView(url));
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
}

export {TabTypes, BrowserConsts, Browser};
