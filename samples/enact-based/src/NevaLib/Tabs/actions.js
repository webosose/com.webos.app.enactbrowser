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
