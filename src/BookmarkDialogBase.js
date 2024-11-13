// Copyright 2024 LG Electronics, Inc.
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

        return this.uioverlay.show({
            target: 'bookmark_dialog',
            bounds: {
                x: l,
                y: h,
                w: w,
            }
        }).then((layer) => {
            if (layer.justCreated) {
                layer.channel.on('contentSwitched', (e) => {
                    if (e.type === 'bookmark_dialog') {
                        this.ipc.post('showBookmarkDialog', bookmarkDialogProps);
                    }
                });
            } else {
                this.ipc.post('showBookmarkDialog', bookmarkDialogProps);
            }
            layer.view.pageContents.setFocus();
            return;
        });
    }

    hide() {
        console.log('BookmarkDialogBase::hide');
        this.uioverlay.hide({target: 'bookmark_dialog'});
    }
}

export default BookmarkDialogBase;
export {BookmarkDialogBase};
