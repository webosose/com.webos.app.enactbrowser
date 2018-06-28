/* actions */

import {actionTypes as types} from './constants';

// Adds a tab
const addTab = (tab, setSelected) => ({
	type: types.ADD_TAB,
	tab,
	setSelected
});

// Replaces a tab in current selected tab
const replaceTab = (index, tab) => ({
	type: types.REPLACE_TAB,
	index,
	tab
});

// Closes a tab of index
const closeTab = (index, newSelectedIndex) => ({
	type: types.CLOSE_TAB,
	index,
	newSelectedIndex
});

// Moves tabs
const moveTab = (fromIndex, toIndex) => ({
	type: types.MOVE_TAB,
	fromIndex,
	toIndex
});

const selectTab = (index) => ({
	type: types.SELECT_TAB,
	index
});

const updateTabState = (id, newState) => ({
	type: types.UPDATE_TAB_STATE,
	id,
	newState
});

export {
	addTab,
	replaceTab,
	closeTab,
	moveTab,
	selectTab,
	updateTabState
}
