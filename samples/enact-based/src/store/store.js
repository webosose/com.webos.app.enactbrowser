// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {createStore,combineReducers} from 'redux';
import {historyUIState, bookmarkUIState, approvedSitesUIState, blockedSitesUIState} from '../reducers';
import {
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState,
	siteFilterState,
	popupState
} from '../NevaLib/Browser/reducers'; // TBD: fix path to '../NevaLib'

export const combinedReducers = combineReducers({
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState,
	historyUIState,
	bookmarkUIState,
	approvedSitesUIState,
	blockedSitesUIState,
	siteFilterState,
	popupState
});

export default function configureStore (initialState) {
	const store = createStore(
		combinedReducers,
		initialState
	);

	if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept('../reducers', () => {
			const nextRootReducer = require('../reducers').default;

			store.replaceReducer(nextRootReducer);
		});
	}

	return store;
}
