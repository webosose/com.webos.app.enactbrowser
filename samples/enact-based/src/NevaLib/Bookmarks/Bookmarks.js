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

import BookmarksBase from 'js-browser-lib/BookmarksBase.js';
import BookmarksIdbStorage from 'js-browser-lib/BookmarksIdbStorage.js';
import {
    addBookmark,
    removeAllBookmarks,
    removeBookmarksByUrl,
    moveBookmark,
    setBookmarkData
} from './actions';

class ReduxBookmarksStore {
    constructor(reduxStore) {
        this.store = reduxStore;
    }

    isBookmarked = (url) => {
        return this.store.getState().bookmarksState.data.some(
            (bookmark) => bookmark.url === url
        );
    }

    count = () => {
        return this.store.getState().bookmarksState.data.length;
    }

    //Needed to initialize store after loading from storage
    set = (data) => {
        this.store.dispatch(setBookmarkData(data));
    }

    add = (url, title, icon) => {
        const bookmark = {
            url: url,
            title: title,
            icon: icon
        };
        this.store.dispatch(addBookmark(bookmark));
        return this.store.getState().bookmarksState.data;
    }

    move = (from, to) => {
        this.store.dispatch(moveBookmark(from, to));
        return this.store.getState().bookmarksState.data;
    }

    remove = (urls) => {
        if (urls) {
            this.store.dispatch(removeBookmarksByUrl(urls));
        }
        return this.store.getState().bookmarksState.data;
    }

    removeAll = () => {
        this.store.dispatch(removeAllBookmarks());
        return [];
    }

}

const MAX_BOOKMARKS = 50;

class Bookmarks extends BookmarksBase {
    constructor(reduxStore, indexedDb) {
        super(
            new ReduxBookmarksStore(reduxStore),
            new BookmarksIdbStorage(indexedDb),
            MAX_BOOKMARKS
        );
    }
}

export default Bookmarks;