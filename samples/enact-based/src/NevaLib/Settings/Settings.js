import SettingsBase from 'js-browser-lib/SettingsBase';
import {SettingsIdbStorage} from 'js-browser-lib/SettingsIdbStorage';
import {
    setStartupPage,
    setHomePageUrl,
    setSearchEngine,
    setPrivateBrowsing,
    setAlwaysShowBookmarks,
    setSiteFiltering,
    setPinNumber
} from  './actions.js';

const SettingsKeys = {
    STARTUP_PAGE_KEY: 'startupPage',
    HOME_PAGE_URL_KEY: 'homePageUrl',
    SEARCH_ENGINE_KEY: 'searchEngine',
    ALWAYS_SHOW_BOOKMARKS_KEY: 'alwaysShowBookmarks',
    PRIVATE_BROWSING_KEY: 'privateBrowsing',
    SITE_FILTERING_KEY: 'siteFiltering',
    PIN_NUMBER_KEY: 'pinNumber'
};

const SettingsConsts = {
    NEW_TAB_PAGE: 'newTabPage',
    CONTINUE: 'continue',
    HOME_PAGE: 'homePage'
};

// Reference implementation of settings
class Settings extends SettingsBase {
    constructor(reduxStore, indexedDb, browser) {
        super(new SettingsIdbStorage(indexedDb));
        this.store = reduxStore;
        this.browser = browser;
    }

    initialize(defaults) {
        const store = this.store;
        return super.initialize(defaults)
            .then((initializedValues) => {
                store.dispatch(setStartupPage(initializedValues[SettingsKeys.STARTUP_PAGE_KEY]));
                store.dispatch(setHomePageUrl(initializedValues[SettingsKeys.HOME_PAGE_URL_KEY]));
                store.dispatch(setSearchEngine(initializedValues[SettingsKeys.SEARCH_ENGINE_KEY]));
                store.dispatch(setAlwaysShowBookmarks(initializedValues[SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY]));
                store.dispatch(setPrivateBrowsing(initializedValues[SettingsKeys.PRIVATE_BROWSING_KEY]));
                store.dispatch(setSiteFiltering(initializedValues[SettingsKeys.SITE_FILTERING_KEY]));
                store.dispatch(setPinNumber(initializedValues[SettingsKeys.PIN_NUMBER_KEY]));
                return initializedValues;
            });
    }

    setStartupPage = (opt) => {
        this.storage.set(SettingsKeys.STARTUP_PAGE_KEY, opt)
            .then(() => {
                this.store.dispatch(setStartupPage(opt));
            });
    }

    getStartupPage = () => {
        return this.store.getState().settingsState.startupPage;
    }

    setHomePageUrl = (url) => {
        this.storage.set(SettingsKeys.HOME_PAGE_URL_KEY, url)
            .then(() => {
                this.store.dispatch(setHomePageUrl(url));
            });
    }

    getHomePageUrl = () => {
        return this.store.getState().settingsState.homePageUrl;
    }

    setSearchEngine = (searchEngine) => {
        this.storage.set(SettingsKeys.SEARCH_ENGINE_KEY, searchEngine)
            .then(() => {
                this.store.dispatch(setSearchEngine(searchEngine));
                this.browser.searchService.engine = searchEngine;
            });
    }

    getSearchEngine = () => {
        return this.store.getState().settingsState.searchEngine;
    }

    setAlwaysShowBookmarks = (bool) => {
        this.storage.set(SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY, bool)
            .then(() => {
                this.store.dispatch(setAlwaysShowBookmarks(bool));
        })
    }

    setPrivateBrowsing = (bool) => {
        this.storage.set(SettingsKeys.PRIVATE_BROWSING_KEY, bool)
            .then(() => {
                this.store.dispatch(setPrivateBrowsing(bool));
            });
    }

    getPrivateBrowsing = () => {
        return this.store.getState().settingsState.privateBrowsing;
    }

    setSiteFiltering = (opt) => {
        this.storage.set(SettingsKeys.SITE_FILTERING_KEY, opt)
            .then(() => {
                this.store.dispatch(setSiteFiltering(opt));
            });
    }

    getSiteFiltering = () => {
        return this.store.getState().settingsState.siteFiltering;
    }

    matchPinCode = (pinCode) => {
        return this.store.getState().settingsState.pinNumber === pinCode;
    }
}

export default Settings;
export {Settings, SettingsKeys, SettingsConsts}