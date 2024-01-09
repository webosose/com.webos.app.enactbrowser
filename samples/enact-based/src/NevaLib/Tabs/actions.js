// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* actions */

import { actionTypes as types } from './constants';

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
const closeTab = (index, newSelectedIndex) => {
	console.log("closedTab action triggered ===> ", index);
	// setRedIndicator({ value: false, index: index })
	return ({
		type: types.CLOSE_TAB,
		index,
		newSelectedIndex
	});
};

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

const setRedIndicator = (data) => {
	return ({
		type: types.SET_RED_INDICATOR,
		payload: data
	});
};

export {
	addTab,
	replaceTab,
	closeTab,
	moveTab,
	selectTab,
	updateTabState,
	setRedIndicator
};