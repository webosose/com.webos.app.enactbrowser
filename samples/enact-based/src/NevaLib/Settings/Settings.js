// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import SettingsBase from 'js-browser-lib/SettingsBase';
import {IdbKeyValueStorage} from 'js-browser-lib/IdbKeyValueStorage';
import {
    setStartupPage,
    setHomePageUrl,
    setSearchEngine,
    setPrivateBrowsing,
    setAlwaysShowBookmarks,
    setSiteFiltering,
    setPinNumber,
    setUseJSErrorPage,
    setRestorePrevSessionPolicy,
    setMaxActiveTabFamilies,
    setMaxSuspendedTabFamilies,
    setMaxSuspendedNormal,
    setMaxSuspendedLow,
    setMaxSuspendedCritical,
} from  './actions.js';

const STORE_NAME = 'settings';

const SettingsKeys = {
    STARTUP_PAGE_KEY: 'startupPage',
    HOME_PAGE_URL_KEY: 'homePageUrl',
    SEARCH_ENGINE_KEY: 'searchEngine',
    ALWAYS_SHOW_BOOKMARKS_KEY: 'alwaysShowBookmarks',
    PRIVATE_BROWSING_KEY: 'privateBrowsing',
    SITE_FILTERING_KEY: 'siteFiltering',
    PIN_NUMBER_KEY: 'pinNumber',
    USE_JS_ERROR_PAGE: 'useJSErrorPage',
    RESTORE_PREV_SESSION_POLICY: 'restorePrevSessionPolicy',
    MAX_ACTIVE_TAB_FAMILIES: 'maxActiveTabFamilies',
    MAX_SUSPENDED_TAB_FAMILIES: 'maxSuspendedTabFamilies',
    MAX_SUSPENDED_NORMAL: 'maxSuspendedNormal',
    MAX_SUSPENDED_LOW: 'maxSuspendedLow',
    MAX_SUSPENDED_CRITICAL: 'maxSuspendedCritical',
    ALERTS_COUNT_BEFORE_PREVENTION_REQUEST: 'alertsCountBeforePreventionRequest',
    PRIVATE_BROWSING_CUE_BG_COLOR: 'privateBrowsingCueBgColor',
    PRIVATE_BROWSING_CUE_TEXT_COLOR: 'privateBrowsingCueTextColor',
};

const SettingsConsts = {
    NEW_TAB_PAGE: 'newTabPage',
    CONTINUE: 'continue',
    HOME_PAGE: 'homePage'
};

const setStore = (store, values) => {
    store.dispatch(setStartupPage(values[SettingsKeys.STARTUP_PAGE_KEY]));
    store.dispatch(setHomePageUrl(values[SettingsKeys.HOME_PAGE_URL_KEY]));
    store.dispatch(setSearchEngine(values[SettingsKeys.SEARCH_ENGINE_KEY]));
    store.dispatch(setAlwaysShowBookmarks(values[SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY]));
    store.dispatch(setPrivateBrowsing(values[SettingsKeys.PRIVATE_BROWSING_KEY]));
    store.dispatch(setSiteFiltering(values[SettingsKeys.SITE_FILTERING_KEY]));
    store.dispatch(setPinNumber(values[SettingsKeys.PIN_NUMBER_KEY]));
    store.dispatch(setUseJSErrorPage(values[SettingsKeys.USE_JS_ERROR_PAGE]));
    store.dispatch(setRestorePrevSessionPolicy(values[SettingsKeys.RESTORE_PREV_SESSION_POLICY]));
    store.dispatch(setMaxActiveTabFamilies(values[SettingsKeys.MAX_ACTIVE_TAB_FAMILIES]));
    store.dispatch(setMaxSuspendedTabFamilies(values[SettingsKeys.MAX_SUSPENDED_TAB_FAMILIES]));
    store.dispatch(setMaxSuspendedNormal(values[SettingsKeys.MAX_SUSPENDED_NORMAL]));
    store.dispatch(setMaxSuspendedLow(values[SettingsKeys.MAX_SUSPENDED_LOW]));
    store.dispatch(setMaxSuspendedCritical(values[SettingsKeys.MAX_SUSPENDED_CRITICAL]));
}

// Reference implementation of settings
class Settings extends SettingsBase {
    constructor(reduxStore, indexedDb, browser) {
        const storage = new IdbKeyValueStorage(STORE_NAME, indexedDb);
        super(storage);
        indexedDb.didOpen.push(() => {
            return storage.getAll()
            .then((values) => setStore(reduxStore, values));
        });
        this.store = reduxStore;
        this.browser = browser;
    }

    initialize(defaults) {
        return super.initialize(defaults)
            .then((initializedValues) => {
                setStore(this.store, initializedValues);
                return initializedValues;
            });
    }

    setStartupPage = (opt) => {
        return this.storage.set(SettingsKeys.STARTUP_PAGE_KEY, opt)
            .then(() => {
                this.store.dispatch(setStartupPage(opt));
            });
    }

    getStartupPage = () => {
        return this.store.getState().settingsState.startupPage;
    }

    setHomePageUrl = (url) => {
        return this.storage.set(SettingsKeys.HOME_PAGE_URL_KEY, url)
            .then(() => {
                this.store.dispatch(setHomePageUrl(url));
            });
    }

    getHomePageUrl = () => {
        return this.store.getState().settingsState.homePageUrl;
    }

    setSearchEngine = (searchEngine) => {
        return this.storage.set(SettingsKeys.SEARCH_ENGINE_KEY, searchEngine)
            .then(() => {
                this.store.dispatch(setSearchEngine(searchEngine));
                this.browser.searchService.engine = searchEngine;
            });
    }

    getSearchEngine = () => {
        return this.store.getState().settingsState.searchEngine;
    }

    setAlwaysShowBookmarks = (bool) => {
        return this.storage.set(SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY, bool)
            .then(() => {
                this.store.dispatch(setAlwaysShowBookmarks(bool));
            })
    }

    setPrivateBrowsing = (bool) => {
        return this.storage.set(SettingsKeys.PRIVATE_BROWSING_KEY, bool)
            .then(() => {
                this.store.dispatch(setPrivateBrowsing(bool));
            });
    }

    getPrivateBrowsing = () => {
        return this.store.getState().settingsState.privateBrowsing;
    }

    setSiteFiltering = (opt) => {
        return this.storage.set(SettingsKeys.SITE_FILTERING_KEY, opt)
            .then(() => {
                this.store.dispatch(setSiteFiltering(opt));
            });
    }

    getSiteFiltering = () => {
        return this.store.getState().settingsState.siteFiltering;
    }

    setPinCode = (code) => {
        return this.storage.set(SettingsKeys.PIN_NUMBER_KEY, code)
            .then(() => {
                this.store.dispatch(setPinNumber(code));
            });
    }

    setUseJSErrorPage = (bool) => {
        return this.storage.set(SettingsKeys.USE_JS_ERROR_PAGE, bool)
            .then(() => {
                this.store.dispatch(setUseJSErrorPage(bool));
            });
    }

    getUseJSErrorPage = () => {
        return this.store.getState().settingsState.useJSErrorPage;
    }

    setRestorePrevSessionPolicy = (string) => {
        return this.storage.set(SettingsKeys.RESTORE_PREV_SESSION_POLICY, string)
            .then(() => {
                this.store.dispatch(setRestorePrevSessionPolicy(string));
            });
    }

    getRestorePrevSessionPolicy = () => {
        return this.store.getState().settingsState.restorePrevSessionPolicy;
    }

    setMaxActiveTabFamilies = (number) => {
        return this.storage.set(SettingsKeys.MAX_ACTIVE_TAB_FAMILIES, number)
            .then(() => {
                this.store.dispatch(setMaxActiveTabFamilies(number));
            });
    }

    getMaxActiveTabFamilies = () => {
        return this.store.getState().settingsState.maxActiveTabFamilies;
    }

    setMaxSuspendedTabFamilies = (number) => {
        return this.storage.set(SettingsKeys.MAX_SUSPENDED_TAB_FAMILIES, number)
            .then(() => {
                this.store.dispatch(setMaxSuspendedTabFamilies(number));
            });
    }

    getMaxSuspendedTabFamilies = () => {
        return this.store.getState().settingsState.maxSuspendedTabFamilies;
    }

    setMaxSuspendedNormal = (number) => {
        return this.storage.set(SettingsKeys.MAX_SUSPENDED_NORMAL, number)
            .then(() => {
                this.store.dispatch(setMaxSuspendedNormal(number));
            });
    }

    getMaxSuspendedNormal = () => {
        return this.store.getState().settingsState.maxSuspendedNormal;
    }

    setMaxSuspendedLow = (number) => {
        return this.storage.set(SettingsKeys.MAX_SUSPENDED_LOW, number)
            .then(() => {
                this.store.dispatch(setMaxSuspendedLow(number));
            });
    }

    getMaxSuspendedLow = () => {
        return this.store.getState().settingsState.maxSuspendedLow;
    }

    setMaxSuspendedCritical = (number) => {
        return this.storage.set(SettingsKeys.MAX_SUSPENDED_CRITICAL, number)
            .then(() => {
                this.store.dispatch(setMaxSuspendedCritical(number));
            });
    }

    getMaxSuspendedCritical = () => {
        return this.store.getState().settingsState.maxSuspendedCritical;
    }

    getAlertsCountBeforePreventionRequest = () => {
        return this.store.getState().settingsState.alertsCountBeforePreventionRequest;
    }

    getPrivateBrowsingCueBgColor = () => {
        return this.store.getState().settingsState.privateBrowsingCueBgColor;
    }

    getPrivateBrowsingCueTextColor = () => {
        return this.store.getState().settingsState.privateBrowsingCueTextColor;
    }

    getVersionString = () => {
        return "version TBD";
        // chrome.runtime.getManifest().version_name;
        // TBD: reimplement in NEVA-6979
    }


    matchPinCode = (pinCode) => {
        return this.store.getState().settingsState.pinNumber === pinCode;
    }
}

export default Settings;
export {Settings, SettingsKeys, SettingsConsts}
