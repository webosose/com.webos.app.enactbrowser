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

/* reducers */

import {actionTypes as types} from './constants';

const
	initialTabsState = {
		selectedIndex: 0,
		ids: [],
		tabs: {} /* id as index, {id, type, canGoBack, canGoForward, isLoading, url, title, favicon} */
	};

function tabsState (state = initialTabsState, action) {
	switch (action.type) {
		case types.ADD_TAB: {
			const newTabs = Object.assign({}, state.tabs, {
				[action.tab.id]: action.tab
			});

			return Object.assign({}, state, {
				selectedIndex: action.setSelected ? state.ids.length : state.selectedIndex,
				ids: [...state.ids, action.tab.id],
				tabs: newTabs
			});
		}
		case types.REPLACE_TAB: {
			let newTabs;

			delete state.tabs[state.ids[action.index]];
			state.ids[action.index] = action.tab.id;

			newTabs = Object.assign({}, state.tabs, {
				[action.tab.id]: action.tab
			});

			return Object.assign({}, state, {
				ids: [...state.ids],
				tabs: newTabs
			});
		}
		case types.CLOSE_TAB: {
			let newTabs;

			delete state.tabs[state.ids[action.index]];
			newTabs = Object.assign({}, state.tabs);
			state.ids.splice(action.index, 1);

			return Object.assign({}, state, {
				selectedIndex: action.newSelectedIndex,
				ids: [...state.ids],
				tabs: newTabs
			});
		}
		case types.MOVE_TAB: {
			const {toIndex, fromIndex} = action;
			state.ids.splice(toIndex, 0, state.ids.splice(fromIndex, 1)[0]);

			return Object.assign({}, state, {
				selectedIndex: toIndex,
				ids: [...state.ids]
			});
		}
		case types.SELECT_TAB: {
			return Object.assign({}, state, {
				selectedIndex: action.index
			});
		}
		case types.UPDATE_TAB_STATE: {
			const
				newState = Object.assign({}, state.tabs[action.id], action.newState),
				newTabs = Object.assign({}, state.tabs, {
					[action.id]: newState
				});

			return Object.assign({}, state, {
				tabs: newTabs
			});
		}
		default:
			return state;
	}
}

export default tabsState;
