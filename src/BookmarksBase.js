// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
Bookmark entry:
{
    pos,
    url,
    title,
    icon
}
*/
class BookmarksBase {
    /**
    class IBookmarksStore {
        isBookmarked = (url) => true if already in bookmarks
        set = (data) - resets store data
        add = (url, title, icon, pos)
        move = (from, to) =>
        remove = (urls) => return this.store.getState().bookmarksState.data;
        removeAll = () => return [];
    }

    class IBookmarksStorage {
        count() => number of bookmarks
        isBookmarked(url) => Promise with true, if url in bookmarks
        getAll() => Promise with array of all bookmarks
        get(from, to) => Promise with array of bookmarks by range
        add(url,title,icon) => add bookmarks to the end of the bookmarks list
        insert(url, title, icon, pos) => insert bookmark to specified position
        move(from), to  => changes position of bookmark
        remove(urls) => remove bookmarks specified by urls(array)
        removeAll() => removes all bookmarks
    }
     */
    constructor (store, storage, maxBookmarks = 100) {
        this.store = store;
        this.storage = storage;
        this.maxBookmarks = maxBookmarks;
    }

    initialize(defaults = null) {
        let initDb = defaults !== null ?
            this.storage.initialize(defaults) :
            Promise.resolve();
        return initDb
            .then(() => this.storage.getAll())
            .then((result) => {
                this.store.set(result);
                return result;
            });
    }

    isBookmarked(url) {
        return this.store.isBookmarked(url);
    }

    count() {
        return this.storage.count();
    }

    // if pos undefined insert to the end
    addBookmark(url, title, icon, pos) {
        if (this.count() <= this.maxBookmarks) {
            if (pos === undefined) {
                pos = this.storage.count();
            }
            const thisBookmarks = this;
            return this.storage.add(url, title, icon, pos)
                .then((result) => {
                    thisBookmarks.store.add(url, title, icon, pos); //?move to UI
                    return result;
                });
        }
        return Promise.reject('Can\'t add bookmark, max bookmarks reached');
    }

    moveBookmark(from, to) {
        if (typeof from === 'number' &&
            typeof to === 'number') {
            const store = this.store;
            return this.storage.move(from, to).
                then((result) => {
                    store.move(from, to);
                    return result;
                });
        }
        return Promise.reject('Move positions is not number');
    }

    removeBookmarks(urls) {
        const store = this.store;
        return this.storage.remove(urls).
            then((result) => {
                this.store.remove(urls);
                return result;
            });
    }

    removeAllBookmarks() {
        const store = this.store;
        return this.storage.removeAll().
            then((result) => {
                this.store.removeAll();
                return result;
            });
    }

}

export default BookmarksBase;
