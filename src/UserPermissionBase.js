// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global document*/

import Ipc from './Ipc.js';

class UserPermissionBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_user_permission');
    }

    show(permissionProps) {
        const inputElem = document.getElementById('omniboxInput'),
            h = inputElem ? inputElem.offsetHeight + 28 : 20,
            cw = document.body.clientWidth / 100,
            l = cw * 10,
            w = cw * 15;

        return this.uioverlay.switchContent('user_permission')
            .then(() => this.uioverlay.setBounds({
                x: l,
                y: h,
                w: w,
            }, 'user_permission'))
            .then(() => this.ipc.post('updatePermission', permissionProps))
            .then(() => this.uioverlay.setVisible(true, 'user_permission'))
            .then(() => {
                this.uioverlay.view.pageContents.setFocus();
            });
    }

    hide() {
        console.log('UserPermissionBase::hide');
        this.uioverlay.setVisible(false, 'user_permission');
    }
}

export default UserPermissionBase;
export {UserPermissionBase};
