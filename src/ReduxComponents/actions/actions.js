// Copyright 2018 LG Electronics, Inc.
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
