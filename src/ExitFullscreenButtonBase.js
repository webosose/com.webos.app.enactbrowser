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
    constructor() {
        this.button = null;
        this.ipc = new Ipc("ipc_exit_fullscreen_button");
    }

    create() {
        if (!this.button) {
            this.button = new PageView;
            this.button.pageContents = new PageContents({
                "api": ["v8/browser_shell_ipc"]
            });
        }
        window.shell.shellWindow.pageView.addChildView(this.button);

        const button_width = 260;
        const button_heigh = 110;

        const x = Math.round((window.innerWidth / 2) - (button_width / 2));
        const y = 20;

        console.log(`Exit FS button set position(x:${x}, y:${y})`);
        console.log(`Exit FS button set size(width:${button_width}, height:${button_heigh})`);

        this.button.setBounds(x, y, button_width, button_heigh);
        this.button.pageContents.setPageBaseBackgroundColor('#00000000');
        // Current impl on Browser Shell do not support relative file paths
        // loadURL and absolute path will be replaced with loadFile(<rel path>) when it will be implemented in Browser Shell
        this.button.pageContents.loadURL("file:///home/lup/work/NEVA-6042/dist/exitbtn/index.html")

        this.hide();
    }

    show() {
        console.log(`BrowserBase::showExitFullscreenButton`);
        this.button.setVisible(true);
        this.button.bringToFront();
    }

    hide() {
        console.log(`BrowserBase::hideExitFullscreenButton`);
        this.button.setVisible(false);
        this.button.sendToBack();
    }

    destroy() {
        console.log(`BrowserBase::destroyExitFullscreenButton`);
        window.shell.shellWindow.pageView.removeChildView(this.button);
        // TDB!!! destroy pageView
    }

};

export default ExitFullscreenButtonBase;
export {ExitFullscreenButtonBase};
