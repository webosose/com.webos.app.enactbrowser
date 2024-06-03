// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* reducers */

import {actionTypes as types} from './constants';

const
	initialSettingsState = {
		startupPage: '',
		homePageUrl: '',
		searchEngine: '',
		alwaysShowBookmarks: false,
		privateBrowsing: false,
		pinNumber: '',
		alertsCountBeforePreventionRequest: 3,
		siteFiltering: '',
		useJSErrorPage: false,
		restorePrevSessionPolicy: 'onlyLastTab',
		maxActiveTabFamilies: 1,
		maxSuspendedTabFamilies: 2,
		maxSuspendedNormal: 3,
		maxSuspendedLow: 1,
		maxSuspendedCritical: 0,
	};

function settingsState (state = initialSettingsState, action) {
	switch (action.type) {
		case types.SET_STARTUP_PAGE: {
			return Object.assign({}, state, {
				startupPage: action.option
			});
		}
		case types.SET_HOME_PAGE_URL: {
			return Object.assign({}, state, {
				homePageUrl: action.url
			});
		}
		case types.SET_SEARCH_ENGINE: {
			return Object.assign({}, state, {
				searchEngine: action.searchEngine
			});
		}
		case types.SET_ALWAYS_SHOW_BOOKMARKS: {
			return Object.assign({}, state, {
				alwaysShowBookmarks: action.bool
			});
		}
		case types.SET_PRIVATE_BROWSING: {
			return Object.assign({}, state, {
				privateBrowsing: action.bool
			});
		}
		case types.SET_PIN_NUMBER: {
			return Object.assign({}, state, {
				pinNumber: action.pinNumber
			});
		}

		/*
			Site filtering
		*/
		case types.SET_SITE_FILTERING: {
			return Object.assign({}, state, {
				siteFiltering: action.option
			});
		}

		case types.SET_USE_JS_ERROR_PAGE: {
			return Object.assign({}, state, {
				useJSErrorPage: action.bool
			});
		}
		case types.SET_RESTORE_PREV_SESSION_POLICY: {
			return Object.assign({}, state, {
				restorePrevSessionPolicy: action.string
			});
		}
		case types.SET_MAX_ACTIVE_TAB_FAMILIES: {
			return Object.assign({}, state, {
				maxActiveTabFamilies: action.number
			});
		}
		case types.SET_MAX_SUSPENDED_TAB_FAMILIES: {
			return Object.assign({}, state, {
				maxSuspendedTabFamilies: action.number
			});
		}

		case types.SET_MAX_SUSPENDED_NORMAL: {
			return Object.assign({}, state, {
				maxSuspendedNormal: action.number
			});
		}

		case types.SET_MAX_SUSPENDED_LOW: {
			return Object.assign({}, state, {
				maxSuspendedLow: action.number
			});
		}

		case types.SET_MAX_SUSPENDED_CRITICAL: {
			return Object.assign({}, state, {
				maxSuspendedCritical: action.number
			});
		}

		default:
			return state;
	}
}

export default settingsState;
