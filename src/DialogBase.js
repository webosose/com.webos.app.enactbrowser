// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import Ipc from './Ipc.js';

class DialogBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_dialog');
    }

    show(dialogProps, bounds) {
        return this.uioverlay.show({
            target: 'dialog',
            bounds: {
                x: bounds.x,
                y: bounds.y,
                w: bounds.width,
                h: bounds.height
            }
        })
            .then(() => this.ipc.post('ipc_dialog', dialogProps));
    }

    hide() {
        console.log(`DialogBase::dialog`);
        this.uioverlay.hide({target: 'dialog'});
    }
};

export {DialogBase};
