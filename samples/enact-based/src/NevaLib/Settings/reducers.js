// Copyright (c) 2018-2019 LG Electronics, Inc.
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
		siteFiltering: 'off',
		approvedSites: [],
		blockedSites: []
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

		/*
			Approved sites
		*/
		case types.SET_APPROVED_SITES: {
			return Object.assign({}, state, {
				approvedSites: [...action.urls]
			});
		}
		case types.ADD_APPROVED_SITE: {
			return [...state.approvedSites.data, action.url];
		}
		case types.REMOVE_APPROVED_SITES: {
			const newData = state.approvedSites.filter((elem) => (
				!action.urls.includes(elem)
			));

			return [...newData];
		}

		/*
			Blocked sites
		*/
		case types.SET_BLOCKED_SITES: {
			return Object.assign({}, state, {
				blockedSites: [...action.urls]
			});
		}
		case types.ADD_BLOCKED_SITE: {
			return [...state.blockedSites.data, action.url];
		}
		case types.REMOVE_BLOCKED_SITES: {
			const newData = state.blockedSites.filter((elem) => (
				!action.urls.includes(elem)
			));

			return [...newData];
		}
		default:
			return state;
	}
}

export default settingsState;
