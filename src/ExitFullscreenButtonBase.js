// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/
/*global window*/

class ExitFullscreenButtonBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        if (typeof window !== 'undefined') {
            this.ipc = new ShellIpc('ipc_FullScreenControl');
        }
    }

    show() {
        console.log(`ExitFullscreenButtonBase::showExitFullscreenButton`);

        const button_width = 260;

        return this.uioverlay.show({
            target: 'exit_fullscreen_button', bounds: {
                x: (window.innerWidth / 2) - (button_width / 2),
                y: 20,
                w: button_width,
                h: 130
            }
        });
    }

    hide() {
        console.log(`ExitFullscreenButtonBase::hideExitFullscreenButton`);
        this.uioverlay.hide({target: 'exit_fullscreen_button'});
    }
}

export {ExitFullscreenButtonBase};
