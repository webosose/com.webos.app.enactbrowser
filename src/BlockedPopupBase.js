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

class BlockedPopupBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_blocked_popup');
    }

    show(popupProps) {
        const inputElem = document.getElementById('omniboxInput'),
            h = inputElem ? inputElem.offsetHeight + 28 : 20,
            cw = document.body.clientWidth / 100,
            l = cw * 60,
            w = cw * 15;

        return this.uioverlay.show({
            target: 'blocked_popup',
            bounds: {
                x: l,
                y: h,
                w: w,
            }
        })
            .then((layer) => {
                this.ipc.post('updateBlockedPopup', popupProps);
                layer.view.pageContents.setFocus();
                return layer;
            });
    }

    hide() {
        this.uioverlay.hide({target: 'blocked_popup'});
    }
}

export default BlockedPopupBase;
export {BlockedPopupBase};
