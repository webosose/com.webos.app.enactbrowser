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
        return this.uioverlay.switchContent('dialog')
            .then(() => this.uioverlay.setBounds({
                x: bounds.x,
                y: bounds.y,
                w: bounds.width,
                h: bounds.height
            }, 'dialog'))
            .then(() => this.ipc.post('ipc_dialog', dialogProps))
            .then(() => this.uioverlay.setVisible(true, 'dialog'));
    }

    hide() {
        console.log(`DialogBase::dialog`);
        this.uioverlay.setVisible(false, 'dialog');
    }
};

export {DialogBase};
