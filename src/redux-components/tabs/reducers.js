// Copyright 2018 LG Electronics, Inc.
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
		selectedIndex: 0, // index in ids[]
		ids: [], //  tab ids (strings) in actual order. Represents tabs order in browser UI (left -> right)
		tabs: {}, /* id as index, {id, type, canGoBack, canGoForward, isLoading, url, title, favicon} */
		displayRedIndicator: [],
		closedTabId: null,
	};

function tabsState (state = initialTabsState, action = {}) {
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
			console.log(`tabsState.CLOSE_TAB reducer. state:`);
			console.log(state);
			let newTabs;
			console.log(`previously selected tab index in ids[] = ${state.selectedIndex}`);
			let selectedId = state.tabs[state.ids[state.selectedIndex]].id;
			console.log(`selected tab id = ${selectedId}`);

			const deletedTabId = Number(state.tabs[state.ids[action.index]].id);
			delete state.tabs[state.ids[action.index]];
			newTabs = Object.assign({}, state.tabs);
			state.ids.splice(action.index, 1);

			let newSelectedIndex = state.ids.indexOf(selectedId);
			console.log(`newly selected tab index in ids[] = ${newSelectedIndex}`);

			// currently selected tab was removed => select next right tab
			if (newSelectedIndex < 0) {
				// The tab, was pointed to by the current index, was removed, so the current
				// index should point to the next tab (action.index)
				// or the last tab (state.ids.length - 1)
				newSelectedIndex = Math.min(action.index, state.ids.length - 1);
			}

			const tempDisplayRedIndicator = [...state.displayRedIndicator];
			/* Below if condition is for automatically removing the red-indicator on the tab if a tab with running red-indicator is closed.
			"closedTabId" is assigned with the tabId of the deletedTab if the closed tab had red-indicator running.
			In all pther cases, "closedTabId" shall be null */
			if (tempDisplayRedIndicator.findIndex(i => i.index == deletedTabId) != -1) {
				return Object.assign({}, state, {
					selectedIndex: state.ids.length <= newSelectedIndex ? 0 : newSelectedIndex,
					ids: [...state.ids],
					tabs: newTabs,
					displayRedIndicator: tempDisplayRedIndicator,
					closedTabId: deletedTabId
				});
			}

			return Object.assign({}, state, {
				ids: [...state.ids],
				tabs: newTabs,
				selectedIndex: newSelectedIndex,
				displayRedIndicator: tempDisplayRedIndicator,
				closedTabId: null,
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

		//It is for showing red indicator on the tab whenever user clicks on "allow" button on the media-permission popup.
		case types.SET_RED_INDICATOR: {
			const tempDisplayRedIndicator = JSON.parse(JSON.stringify(state.displayRedIndicator));
			const redIndicatorIndex = tempDisplayRedIndicator.findIndex(i => i.index == action.payload.index);
			if (action.payload.audio == true || action.payload.video == true) {
				if (redIndicatorIndex > -1) {
					tempDisplayRedIndicator[redIndicatorIndex] = Object.assign(tempDisplayRedIndicator[redIndicatorIndex], action.payload);
				} else {
					tempDisplayRedIndicator.push(action.payload);
				}
			} else if ((action.payload.audio == false || action.payload.video == false) && redIndicatorIndex > -1) {
				if (redIndicatorIndex > -1) {
					let removeIndex;
					if (action.payload.audio == false) {
						removeIndex = tempDisplayRedIndicator.findIndex(i => (i.index == action.payload.index) && i.audio == true);
					}
					if (action.payload.video == false) {
						removeIndex = tempDisplayRedIndicator.findIndex(i => (i.index == action.payload.index) && i.video == true);
					}
					tempDisplayRedIndicator.splice(removeIndex, 1);
				}
			}

			//When all entries corresponding to particular tabId is deleted, resetClosedTabId variable is used to reset the closedTabId to null.
			const resetClosedTabId = tempDisplayRedIndicator.findIndex(i => i.index == action.payload.index) == -1 ? null : state.closedTabId;
			return Object.assign({}, state, {
				displayRedIndicator: tempDisplayRedIndicator,
				closedTabId: resetClosedTabId
			});
		}

		default:
			return state;
	}
}

export default tabsState;
