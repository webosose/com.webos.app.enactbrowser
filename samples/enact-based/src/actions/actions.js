// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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

const selectApprovedSite = (index, selected) => ({
	type: 'SELECT_APPROVED_SITE',
	index,
	selected
});

const selectAllApprovedSites = (ids) => ({
	type: 'SELECT_ALL_APPROVED_SITES',
	ids
});

const deselectAllApprovedSites = () => ({
	type: 'DESELCT_ALL_APPROVED_SITES'
});

const selectBlockedSite = (index, selected) => ({
	type: 'SELECT_BLOCKED_SITE',
	index,
	selected
});

const selectAllBlockedSites = (ids) => ({
	type: 'SELECT_ALL_BLOCKED_SITES',
	ids
});

const deselectAllBlockedSites = () => ({
	type: 'DESELCT_ALL_BLOCKED_SITES'
});

export {
	selectHistory,
	selectAllHistory,
	deselectAllHistory,
	selectBookmark,
	selectAllBookmarks,
	deselectAllBookmarks,
	moveBookmarkSelected,
	selectApprovedSite,
	selectAllApprovedSites,
	deselectAllApprovedSites,
	selectBlockedSite,
	selectAllBlockedSites,
	deselectAllBlockedSites
};
