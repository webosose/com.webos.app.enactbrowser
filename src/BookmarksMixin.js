// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
