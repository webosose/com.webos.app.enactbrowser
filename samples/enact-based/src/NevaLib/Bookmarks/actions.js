// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
