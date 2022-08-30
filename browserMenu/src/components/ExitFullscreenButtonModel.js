// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import Ipc from '../../../src/Ipc';

class ExitFullscreenButtonModel {
    constructor() {
        this.ipc = new Ipc("ipc_exit_fullscreen_button");
    }

    onClick() {
        return () => {
            console.log(`ExitFullscreenButton::onClick >>>`);
            this.ipc.post('exit-fullscreen');
        }
    }
}

export default ExitFullscreenButtonModel;
