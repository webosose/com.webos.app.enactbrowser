// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

import {createStore, combineReducers} from 'redux';
import {historyUIState, bookmarkUIState, approvedSitesUIState, blockedSitesUIState} from '../reducers';
import {
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState
} from '../NevaLib/Browser/reducers'; // TBD: fix path to '../NevaLib'

const combinedReducers = combineReducers({
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState,
	historyUIState,
	bookmarkUIState,
	approvedSitesUIState,
	blockedSitesUIState
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
