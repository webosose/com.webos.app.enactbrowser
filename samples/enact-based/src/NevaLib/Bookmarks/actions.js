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
