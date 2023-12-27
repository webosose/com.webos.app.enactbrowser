// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

const setFullScreen = (enable) => ({
	type: 'SET_FULLSCREEN',
	enable
});

const setBrowserLoadingCompleted = (completed) => ({
	type: 'SET_BROWSER_LOADING_COMPLETED',
	completed
});

const setWebContentFullscreen = (enable) => ({
	type: 'SET_WEB_CONTENT_FULLSCREEN',
	enable
});

const selectHistory = (id, selected) => ({
	type: 'SELECT_HISTORY',
	id,
	selected
});

const selectAllHistory = (ids) => ({
	type: 'SELECT_ALL_HISTORY',
	ids
});

const deselectAllHistory = () => ({
	type: 'DESELECT_ALL_HISTORY'
});

const selectBookmark = (index, selected) => ({
	type: 'SELECT_BOOKMARK',
	index,
	selected
});

const selectAllBookmarks = (ids) => ({
	type: 'SELECT_ALL_BOOKMARKS',
	ids
});

const deselectAllBookmarks = () => ({
	type: 'DESELECT_ALL_BOOKMARKS'
});

const moveBookmarkSelected = (fromIndex, toIndex) => ({
	type: 'MOVE_BOOKMARK_SELECTED',
	fromIndex,
	toIndex
});

export {
	setFullScreen,
	setWebContentFullscreen,
	selectHistory,
	selectAllHistory,
	deselectAllHistory,
	selectBookmark,
	selectAllBookmarks,
	deselectAllBookmarks,
	moveBookmarkSelected,
	setBrowserLoadingCompleted,
};
