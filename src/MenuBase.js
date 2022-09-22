// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global document*/
/*global window*/

import Ipc from './Ipc.js';

class Menu {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;

        if (typeof window !== 'undefined') {
            this.menuIpc = new Ipc("ipc_menu");
            this.menuIpc.subscribe('click', () => {
                this.hide();
            });
            const launchArgs = window.shell.launchArgs;
            this.devSettings = launchArgs.devSettings ? launchArgs.devSettings : false;    
        }

        this.doneOnce = false;
    }

    showAbove(buttonId) {
        console.log(`show browser menu`);

        let button = document.getElementById(buttonId);
        const buttonHeight = button.offsetHeight + 20;
        const leftBorderWidth = (document.body.clientWidth / 100) * 70;  // 10% of the document width
        const width = document.body.clientWidth - leftBorderWidth;

        return this.uioverlay.switchContent('browser_menu')
            .then(() => this.uioverlay.setBounds({
                x: leftBorderWidth,
                y: buttonHeight,
                w: width
            }, 'browser_menu'))
            .then(() => this.uioverlay.setVisible(true))
            .then(() => {
                if (!this.doneOnce) {
                    console.log(`browser.devSettingsEnabled = ${this.devSettings}`);
                    this.menuIpc.post('showDevSettings', {showDevSettingsItem: this.devSettings});
                    this.doneOnce = true;
                }
                this.uioverlay.view.pageContents.setFocus();
            })
    }

    destroy() {}

    hide() {
        console.log(`hide browser menu`);
        this.uioverlay.setVisible(false, 'browser_menu');
    }

};

export default Menu;
export {Menu};
