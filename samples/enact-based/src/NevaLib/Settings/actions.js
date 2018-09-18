// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* actions */

import {actionTypes as types} from './constants';

const setStartupPage = (option) => ({
	type: types.SET_STARTUP_PAGE,
	option
});

const setHomePageUrl = (url) => ({
	type: types.SET_HOME_PAGE_URL,
	url
});

const setSearchEngine = (searchEngine) => ({
	type: types.SET_SEARCH_ENGINE,
	searchEngine
});

const setAlwaysShowBookmarks = (bool) => ({
	type: types.SET_ALWAYS_SHOW_BOOKMARKS,
	bool
});

const setPrivateBrowsing = (bool) => ({
	type: types.SET_PRIVATE_BROWSING,
	bool
});

const setPinNumber = (pinNumber) => ({
	type: types.SET_PIN_NUMBER,
	pinNumber
});

const setSiteFiltering = (option) => ({
	type: types.SET_SITE_FILTERING,
	option
});

const addApprovedSite = (url) => ({
	type: types.ADD_APPROVED_SITE,
	url
});

const removeApprovedSites = (urls) => ({
	type: types.REMOVE_APPROVED_SITES,
	urls
})

const addBlockedSite = (url) => ({
	type: types.ADD_BLOCKED_SITE,
	url
});

const removeBlockedSites = (urls) => ({
	type: types.REMOVE_BLOCKED_SITES,
	urls
})

export {
	setStartupPage,
	setHomePageUrl,
	setSearchEngine,
	setAlwaysShowBookmarks,
	setPrivateBrowsing,
	setPinNumber,
	setSiteFiltering,
	addApprovedSite,
	removeApprovedSites,
	addBlockedSite,
	removeBlockedSites
}
