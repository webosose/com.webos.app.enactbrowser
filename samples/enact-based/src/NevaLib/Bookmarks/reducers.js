// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* reducers */

import {actionTypes as types} from './constants';

const
	initialBookmarksState = {
		data: []
	};

function bookmarksState (state = initialBookmarksState, action = '') {
	switch (action.type) {
		case types.SET_BOOKMARK_DATA: {
			return Object.assign({}, state, {
				data: action.data
			});
		}
		case types.ADD_BOOKMARK: {
			return Object.assign({}, state, {
				data: [...state.data, action.bookmark]
			});
		}
		case types.MOVE_BOOKMARK: {
			const
				{toIndex, fromIndex} = action,
				{data} = state;

			data.splice(toIndex, 0, data.splice(fromIndex, 1)[0]);

			return Object.assign({}, state, {
				data: [...data]
			});
		}
		case types.REMOVE_BOOKMARKS: {
			const newData = state.data.filter((elem, index) => (
				!action.selected.includes(index)
			));
			return Object.assign({}, state, {
				data: newData
			});
		}
		case types.REMOVE_BOOKMARKS_BY_URL: {
			const newData = state.data.filter((elem) => (
				!action.urls.includes(elem.url)
			));
			return Object.assign({}, state, {
				data: newData
			});
		}
		case types.REMOVE_ALL_BOOKMARKS: {
			return Object.assign({}, state, {
				data: []
			});
		}
		default:
			return state;
	}
}

export default bookmarksState;
