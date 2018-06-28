import {BrowserConsts} from './BrowserConsts';
import {TabTitles, TabTypes} from './TabsConsts';

Object.assign(TabTitles, {
    BOOKMARKS_TITLE: 'Bookmarks'
});

Object.assign(BrowserConsts, {
    BOOKMARKS_URL: 'chrome://bookmarks',
    BOOKMARKS_ID: 'bookmarks'
});


const BookmarksMixin = (superclass) => (class extends superclass {
    constructor({bookmarks, ...rest}) {
        super(rest);
        this.bookmarks = bookmarks;
    }

    openBookmarks() {
        this.tabs.addTab(this._createManagePage(
            BrowserConsts.BOOKMARKS_ID,
            TabTypes.BOOKMARKS,
            TabTitles.BOOKMARKS_TITLE,
            BrowserConsts.BOOKMARKS_URL), true);
    }

    // add bookmark for current tab
    addBookmark() {
        const tab = this.getSelectedTabState();
        this.bookmarks.addBookmark(tab.navState.url, tab.title, tab.icon);
    }

    // remove bookmark for current tab
    removeBookmark() {
        const tab = this.getSelectedTabState();
        this.bookmarks.removeBookmarks([tab.navState.url]);
    }
});

export default BookmarksMixin;
export {BookmarksMixin};
