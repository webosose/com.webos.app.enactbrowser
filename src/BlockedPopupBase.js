// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
