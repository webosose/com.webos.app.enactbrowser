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
		siteFiltering: '',
		approvedSites: ['www.google.com', 'www.daum.net', 'www.lg.com'],
		blockedSites: ['www.naver.com', 'www.netmarble.com']
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
