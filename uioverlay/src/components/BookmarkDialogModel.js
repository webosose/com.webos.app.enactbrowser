// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

class BookmarkDialogModel {
    constructor() {
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc('ipc_bookmark_dialog');
            this.ipc.on('showBookmarkDialog', (data) => {
                console.log(`showBookmarkDialog arrived`, data);
                const event = new CustomEvent('showBookmarkDialogEvent', {detail: data});
                document.dispatchEvent(event);
            });
        }
    }

    click(isAddToHome) {
        this.ipc.post('add_bookmark_to_home', {isAddToHome});
    }
}

export default BookmarkDialogModel;
