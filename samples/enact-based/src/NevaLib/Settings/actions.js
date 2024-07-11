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

const setApprovedSites = (urls) => ({
	type: types.SET_APPROVED_SITES,
	urls
});

const addApprovedSite = (url) => ({
	type: types.ADD_APPROVED_SITE,
	url
});

const removeApprovedSites = (urls) => ({
	type: types.REMOVE_APPROVED_SITES,
	urls
});

const setBlockedSites = (urls) => ({
	type: types.SET_BLOCKED_SITES,
	urls
});

const addBlockedSite = (url) => ({
	type: types.ADD_BLOCKED_SITE,
	url
});

const removeBlockedSites = (urls) => ({
	type: types.REMOVE_BLOCKED_SITES,
	urls
});

const setUseJSErrorPage = (bool) => ({
	type: types.SET_USE_JS_ERROR_PAGE,
	bool
});

const setRestorePrevSessionPolicy = (string) => ({
	type: types.SET_RESTORE_PREV_SESSION_POLICY,
	string
});

const setMaxActiveTabFamilies = (number) => ({
	type: types.SET_MAX_ACTIVE_TAB_FAMILIES,
	number
});

const setMaxSuspendedTabFamilies = (number) => ({
	type: types.SET_MAX_SUSPENDED_TAB_FAMILIES,
	number
});

const setMaxSuspendedNormal = (number) => ({
	type: types.SET_MAX_SUSPENDED_NORMAL,
	number
});

const setMaxSuspendedLow = (number) => ({
	type: types.SET_MAX_SUSPENDED_LOW,
	number
});

const setMaxSuspendedCritical = (number) => ({
	type: types.SET_MAX_SUSPENDED_CRITICAL,
	number
});

export {
	setStartupPage,
	setHomePageUrl,
	setSearchEngine,
	setAlwaysShowBookmarks,
	setPrivateBrowsing,
	setPinNumber,
	setSiteFiltering,
	setApprovedSites,
	addApprovedSite,
	removeApprovedSites,
	setBlockedSites,
	addBlockedSite,
	removeBlockedSites,
	setUseJSErrorPage,
	setRestorePrevSessionPolicy,
	setMaxActiveTabFamilies,
	setMaxSuspendedTabFamilies,
	setMaxSuspendedNormal,
	setMaxSuspendedLow,
	setMaxSuspendedCritical,
};
