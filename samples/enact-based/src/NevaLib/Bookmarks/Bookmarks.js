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