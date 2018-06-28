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
