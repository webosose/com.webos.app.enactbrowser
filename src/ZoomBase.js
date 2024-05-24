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

class ZoomControl {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;

        if (typeof window !== 'undefined') {
            this.menuIpc = new Ipc("ipc_ZoomControl");
            this.menuIpc.subscribe('click', () => {
                this.hide();
            });
        }
    }

    showAbove(buttonId) {
        console.log(`show zoom control`);

        let button = document.getElementById(buttonId);
        const buttonHeight = button.offsetHeight + 20;
        const leftBorderWidth = (document.body.clientWidth / 100) * 75;
        const width = 90;

        return this.uioverlay.show({
            target: 'zoom_control', bounds: {
                x: leftBorderWidth,
                y: buttonHeight,
                w: width
            }
        }).then((layer) => layer.view.pageContents.setFocus());
    }

    destroy() {}

    hide() {
        console.log(`hide zoom control`);
        this.uioverlay.hide({target: 'zoom_control'});
    }
};

export default ZoomControl;
export {ZoomControl};
