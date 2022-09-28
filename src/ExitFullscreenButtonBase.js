// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/

import Ipc from './Ipc.js';

class ExitFullscreenButtonBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_exit_fullscreen_button');
    }

    show() {
        console.log(`BrowserBase::showExitFullscreenButton`);

        const button_width = 260;

        this.uioverlay.switchContent('exit_fullscreen_button')
            .then(() => this.uioverlay.setBounds({
                x: (window.innerWidth / 2) - (button_width / 2),
                y: 20,
                w: button_width,
                h: 130
            }, 'exit_fullscreen_button'))
            .then(() => this.uioverlay.setVisible(true));
    }

    hide() {
        console.log(`BrowserBase::hideExitFullscreenButton`);
        this.uioverlay.setVisible(false, 'exit_fullscreen_button');
    }
};

export {ExitFullscreenButtonBase};
