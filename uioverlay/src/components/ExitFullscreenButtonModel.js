// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* global ShellIpc */

class ExitFullscreenButtonModel {
    constructor() {
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc("ipc_FullScreenControl");
        }
    }

    onClick() {
        return () => {
            console.log(`ExitFullscreenButton::onClick >>>`);
            this.ipc.post('exit-fullscreen');
        };
    }
}

export default ExitFullscreenButtonModel;
