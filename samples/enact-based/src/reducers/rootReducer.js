// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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

function historyUIState (state = initialHistory, action = '') {
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

function bookmarkUIState (state = initialBookmark, action = '') {
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

function approvedSitesUIState (state = initialApprovedSites, action = '') {
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

function blockedSitesUIState (state = initialBlockedSites, action = '') {
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
