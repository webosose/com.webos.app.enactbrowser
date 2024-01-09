// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* reducers */

import {actionTypes as types} from './constants';
import tabsState from '../Tabs/reducers';
import settingsState from '../Settings/reducers';
import historyState from '../History/reducers';
import bookmarksState from '../Bookmarks/reducers';
import siteFilterState from '../SiteFiltering/reducers';
import popupState from '../Popup/reducers';

const
	initialBrowserState = {
		zoomFactor: 1,
		recentlyClosed: [],
		urlSuggestions: [],
		mostVisitedSites: []
	};

function browserState (state = initialBrowserState, action = '') {
	switch (action.type) {
		case types.SET_ZOOM_FACTOR: {
			return Object.assign({}, state, {
				zoomFactor: action.value
			});
		}
		case types.SET_RECENTLY_CLOSED: {
			return Object.assign({}, state, {
				recentlyClosed: [...action.data]
			});
		}
		case types.SET_URL_SUGGESTIONS: {
			return Object.assign({}, state, {
				urlSuggestions: [...action.data]
			});
		}
		case types.SET_MOST_VISITED_SITES: {
			return Object.assign({}, state, {
				mostVisitedSites: [...action.data]
			});
		}
		case types.REMOVE_MOST_VISITED_SITE: {
			const newArray = state.mostVisitedSites.filter(sites => sites.url !== action.url);
			return Object.assign({}, state, {
				mostVisitedSites: [...newArray]
			});
		}
		default:
			return state;
	}
}

export default browserState;
export {
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState,
	siteFilterState,
	popupState
};
