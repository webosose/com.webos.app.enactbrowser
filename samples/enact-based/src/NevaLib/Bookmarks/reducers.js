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
	initialBookmarksState = {
		data: []
	};

function bookmarksState (state = initialBookmarksState, action) {
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
