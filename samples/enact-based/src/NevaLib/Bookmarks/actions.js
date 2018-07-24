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

const setBookmarkData = (data) => ({
	type: types.SET_BOOKMARK_DATA,
	data
});

const addBookmark = (bookmark) => ({
	type: types.ADD_BOOKMARK,
	bookmark
});

const removeBookmarks = (selected) => ({
	type: types.REMOVE_BOOKMARKS,
	selected
});

const removeAllBookmarks = () => ({
	type: types.REMOVE_ALL_BOOKMARKS
});

const removeBookmarksByUrl = (urls) => ({
	type: types.REMOVE_BOOKMARKS_BY_URL,
	urls
});

const moveBookmark = (fromIndex, toIndex) => ({
	type: types.MOVE_BOOKMARK,
	fromIndex,
	toIndex
});

export {
	setBookmarkData,
	addBookmark,
	removeBookmarks,
	removeAllBookmarks,
	removeBookmarksByUrl,
	moveBookmark
};
