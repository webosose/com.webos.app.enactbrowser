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

class ChromeExtensionsBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;

        if (typeof window !== 'undefined') {
            this.ipc = new Ipc("ipc_chrome_extensions");
            this.ipc.subscribe('click', () => {
                this.hide();
                if (typeof window !== 'undefined') {
                    window.shell.shellWindow.pageView.pageContents.setFocus();
                }
            });
        }
    }

    showAbove(button) {
        console.log(`show chrome extensions menu`);
        const buttonHeight = button.offsetHeight + 20;
        const leftBorderWidth = (document.body.clientWidth / 100) * 70;  // 10% of the document width
        const width = document.body.clientWidth - leftBorderWidth;

        return this.uioverlay.show({
            target: 'chrome_extensions', bounds: {
                x: leftBorderWidth,
                y: buttonHeight,
                w: width
            }
        }).then((layer) => {
            layer.view.pageContents.setFocus();
            return new Promise((resolve) => {
                window.neva.getExtensionsInfo((infos) => {
                    console.log(JSON.stringify(infos));
                    this.ipc.post('extenstionsListUpdated', infos);
                    resolve();
                });
            });
        });
    }

    destroy() {}

    hide() {
        console.log(`hide chrome extensions menu`);
        return this.uioverlay.hide({target: 'chrome_extensions'});
    }

}

export default ChromeExtensionsBase;
export {ChromeExtensionsBase};
