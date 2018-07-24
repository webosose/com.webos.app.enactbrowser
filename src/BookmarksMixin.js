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
