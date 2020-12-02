// Copyright (c) 2018-2020 LG Electronics, Inc.
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
	setPinNumber
} from  './actions.js';

const STORE_NAME = 'settings';

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

const setStore = (store, values) => {
	store.dispatch(setStartupPage(values[SettingsKeys.STARTUP_PAGE_KEY]));
	store.dispatch(setHomePageUrl(values[SettingsKeys.HOME_PAGE_URL_KEY]));
	store.dispatch(setSearchEngine(values[SettingsKeys.SEARCH_ENGINE_KEY]));
	store.dispatch(setAlwaysShowBookmarks(values[SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY]));
	store.dispatch(setPrivateBrowsing(values[SettingsKeys.PRIVATE_BROWSING_KEY]));
	store.dispatch(setSiteFiltering(values[SettingsKeys.SITE_FILTERING_KEY]));
	store.dispatch(setPinNumber(values[SettingsKeys.PIN_NUMBER_KEY]));
};

// Reference implementation of settings
class Settings extends SettingsBase {
	constructor (reduxStore, indexedDb, browser) {
		const storage = new IdbKeyValueStorage(STORE_NAME, indexedDb);
		super(storage);
		indexedDb.didOpen.push(() => {
			return storage.getAll()
				.then((values) => setStore(reduxStore, values));
		});
		this.store = reduxStore;
		this.browser = browser;
	}

	initialize (defaults) {
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
	};

	getStartupPage = () => {
		return this.store.getState().settingsState.startupPage;
	};

	setHomePageUrl = (url) => {
		return this.storage.set(SettingsKeys.HOME_PAGE_URL_KEY, url)
			.then(() => {
				this.store.dispatch(setHomePageUrl(url));
			});
	};

	getHomePageUrl = () => {
		return this.store.getState().settingsState.homePageUrl;
	};

	setSearchEngine = (searchEngine) => {
		return this.storage.set(SettingsKeys.SEARCH_ENGINE_KEY, searchEngine)
			.then(() => {
				this.store.dispatch(setSearchEngine(searchEngine));
				this.browser.searchService.engine = searchEngine;
			});
	};

	getSearchEngine = () => {
		return this.store.getState().settingsState.searchEngine;
	};

	setAlwaysShowBookmarks = (bool) => {
		return this.storage.set(SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY, bool)
			.then(() => {
				this.store.dispatch(setAlwaysShowBookmarks(bool));
			});
	};

	setPrivateBrowsing = (bool) => {
		return this.storage.set(SettingsKeys.PRIVATE_BROWSING_KEY, bool)
			.then(() => {
				this.store.dispatch(setPrivateBrowsing(bool));
			});
	};

	getPrivateBrowsing = () => {
		return this.store.getState().settingsState.privateBrowsing;
	};

	setSiteFiltering = (opt) => {
		return this.storage.set(SettingsKeys.SITE_FILTERING_KEY, opt)
			.then(() => {
				this.store.dispatch(setSiteFiltering(opt));
			});
	};

	getSiteFiltering = () => {
		return this.store.getState().settingsState.siteFiltering;
	};

	setPinCode = (code) => {
		return this.storage.set(SettingsKeys.PIN_NUMBER_KEY, code)
			.then(() => {
				this.store.dispatch(setPinNumber(code));
			});
	};

	matchPinCode = (pinCode) => {
		return this.store.getState().settingsState.pinNumber === pinCode;
	};
}

export default Settings;
export {Settings, SettingsKeys, SettingsConsts};
