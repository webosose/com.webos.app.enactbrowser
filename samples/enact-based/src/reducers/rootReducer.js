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

import {combineReducers} from 'redux';

const
	initialHistory = {
		selected: []
	},
	initialBookmark = {
		selected: []
	},
	initialApprovedSites = {
		selected: []
	},
	initialBlockedSites = {
		selected: []
	};

function historyUIState (state = initialHistory, action) {
	switch (action.type) {
		case 'SELECT_HISTORY': {
			const newSelected = state.selected.slice();
			if (action.selected) {
				newSelected.push(action.id);
			} else {
				newSelected.splice(newSelected.indexOf(action.id), 1);
			}
			return Object.assign({}, state, {
				selected: newSelected
			});
		}
		case 'SELECT_ALL_HISTORY': {
			return Object.assign({}, state, {
				selected: [...action.ids]
			});
		}
		case 'DESELECT_ALL_HISTORY': {
			return Object.assign({}, state, {
				selected: []
			});
		}
		default:
			return state;
	}
}

function bookmarkUIState (state = initialBookmark, action) {
	switch (action.type) {
		case 'SELECT_BOOKMARK': {
			const newSelected = state.selected.slice();
			if (action.selected) {
				newSelected.push(action.index);
			} else {
				newSelected.splice(newSelected.indexOf(action.index), 1);
			}
			return Object.assign({}, state, {
				selected: newSelected
			});
		}
		case 'SELECT_ALL_BOOKMARKS': {
			return Object.assign({}, state, {
				selected: action.ids
			});
		}
		case 'DESELECT_ALL_BOOKMARKS': {
			return Object.assign({}, state, {
				selected: []
			});
		}
		case 'MOVE_BOOKMARK_SELECTED': {
			const
				{toIndex, fromIndex} = action,
				{selected} = state;

			if (fromIndex > toIndex) {
				for (let i = 0; i < selected.length; i++) {
					if (selected[i] === fromIndex) {
						selected[i] = toIndex;
					} else if (selected[i] < fromIndex && selected[i] >= toIndex) {
						selected[i] += 1;
					}
				}
			} else if (fromIndex < toIndex) {
				for (let i = 0; i < selected.length; i++) {
					if (selected[i] === fromIndex) {
						selected[i] = toIndex;
					} else if (selected[i] > fromIndex && selected[i] <= toIndex) {
						selected[i] -= 1;
					}
				}
			}

			return Object.assign({}, state, {
				selected: [...selected]
			});
		}
		default:
			return state;
	}
}

function approvedSitesUIState (state = initialApprovedSites, action) {
	switch (action.type) {
		case 'SELECT_APPROVED_SITE': {
			const newSelected = state.selected.slice();
			if (action.selected) {
				newSelected.push(action.index);
			} else {
				newSelected.splice(newSelected.indexOf(action.index), 1);
			}
			return Object.assign({}, state, {
				selected: newSelected
			});
		}
		case 'SELECT_ALL_APPROVED_SITES': {
			return Object.assign({}, state, {
				selected: [...action.ids]
			});
		}
		case 'DESELCT_ALL_APPROVED_SITES': {
			return Object.assign({}, state, {
				selected: []
			});
		}
		default:
			return state;
	}
}

function blockedSitesUIState (state = initialBlockedSites, action) {
	switch (action.type) {
		case 'SELECT_BLOCKED_SITE': {
			const newSelected = state.selected.slice();
			if (action.selected) {
				newSelected.push(action.index);
			} else {
				newSelected.splice(newSelected.indexOf(action.index), 1);
			}
			return Object.assign({}, state, {
				selected: newSelected
			});
		}
		case 'SELECT_ALL_BLOCKED_SITES': {
			return Object.assign({}, state, {
				selected: [...action.ids]
			});
		}
		case 'DESELCT_ALL_BLOCKED_SITES': {
			return Object.assign({}, state, {
				selected: []
			});
		}
		default:
			return state;
	}
}

const rootReducer = combineReducers({
	historyUIState,
	bookmarkUIState,
	approvedSitesUIState,
	blockedSitesUIState
});

export default rootReducer;
export {
	historyUIState,
	bookmarkUIState,
	approvedSitesUIState,
	blockedSitesUIState
};
