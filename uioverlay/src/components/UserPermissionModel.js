// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

class UserPermissionModel {
    constructor() {
        console.log('UserPermissionModel created');
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc('ipc_user_permission');
            this.ipc.on('updatePermission', (data) => {
                console.log(`updatePermission arrived ${data}`);
                const event = new CustomEvent('updatePermissionEvent', { detail: data });
                document.dispatchEvent(event);
            });
        }
    }

    submit(data) {
        return () => {
            console.log('UserPermissionModel::submit');
            this.ipc.post('submit', data);
        };
    }
}

export default UserPermissionModel;
