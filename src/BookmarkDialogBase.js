// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global document*/

import Ipc from './Ipc.js';

class BookmarkDialogBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_bookmark_dialog');
    }

    show(bookmarkDialogProps) {
        const inputElem = document.getElementById('omniboxInput'),
            h = inputElem ? inputElem.offsetHeight + 28 : 20,
            cw = document.body.clientWidth / 100,
            w = cw * 30,
            l = cw * 70 - w / 2; // Align the dialog position to the center

        return this.uioverlay.switchContent('bookmark_dialog')
            .then(() => this.uioverlay.setBounds({
                x: l,
                y: h,
                w: w,
            }, 'bookmark_dialog'))
            .then(() => this.ipc.post('showBookmarkDialog', bookmarkDialogProps))
            .then(() => this.uioverlay.setVisible(true, 'bookmark_dialog'))
            .then(() => this.uioverlay.view.pageContents.setFocus());
    }

    hide() {
        console.log('BookmarkDialogBase::hide');
        this.uioverlay.setVisible(false, 'bookmark_dialog');
    }
}

export default BookmarkDialogBase;
export {BookmarkDialogBase};
