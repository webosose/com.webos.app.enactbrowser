// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* reducers */

import { actionTypes as types } from './constants';

const
	initialTabsState = {
		selectedIndex: 0,
		ids: [],
		tabs: {}, /* id as index, {id, type, canGoBack, canGoForward, isLoading, url, title, favicon} */
		displayRedIndicator: [],
		closedTabId: null
	};

function tabsState(state = initialTabsState, action = '') {
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

			let deletedTabId = Number(state.tabs[state.ids[action.index]].id);
			delete state.tabs[state.ids[action.index]];
			newTabs = Object.assign({}, state.tabs);
			state.ids.splice(action.index, 1);
			let tempDisplayRedIndicator = [...state.displayRedIndicator];
			/* Below if condition is for automatically removing the red-indicator on the tab if a tab with running red-indicator is closed.
			"closedTabId" is assigned with the tabId of the deletedTab if the closed tab had red-indicator running.
			In all pther cases, "closedTabId" shall be null */
			if (tempDisplayRedIndicator.findIndex(i => i.index == deletedTabId) != -1) {
				let finalState = Object.assign({}, state, {
					selectedIndex: state.ids.length <= action.newSelectedIndex ? 0 : action.newSelectedIndex,
					ids: [...state.ids],
					tabs: newTabs,
					displayRedIndicator: tempDisplayRedIndicator,
					closedTabId: deletedTabId
				});
				return finalState;
			}

			return Object.assign({}, state, {
				selectedIndex: state.ids.length <= action.newSelectedIndex ? 0 : action.newSelectedIndex,
				ids: [...state.ids],
				tabs: newTabs,
				displayRedIndicator: tempDisplayRedIndicator,
				closedTabId: null
			});
		}
		case types.MOVE_TAB: {
			const { toIndex, fromIndex } = action;
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
			let tempDisplayRedIndicator = JSON.parse(JSON.stringify(state.displayRedIndicator));

			if ((action.payload.audio == true) || (action.payload.video == true)) {
				tempDisplayRedIndicator.push(action.payload);
			} else if (((action.payload.audio == false) || (action.payload.video == false)) && tempDisplayRedIndicator.findIndex(i => i.index == action.payload.index) != -1) {
				if (tempDisplayRedIndicator.findIndex(i => i.index == action.payload.index) !== -1) {

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


			//When all entries corresponding to particular tabId is deleted,resetClosedTabId variable is used to reset the closedTabId to null.
			let resetClosedTabId;

			resetClosedTabId = tempDisplayRedIndicator.findIndex(i => i.index == action.payload.index) == -1 ? null : state.closedTabId;
			let finalState = Object.assign({}, state, {
				displayRedIndicator: tempDisplayRedIndicator,
				closedTabId: resetClosedTabId
			});

			return finalState;
		}
		default:
			return state;
	}
}

export default tabsState;
