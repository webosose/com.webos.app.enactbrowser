// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* global ShellIpc */

class ZoomControlModel {
    constructor() {
        console.log(`ZoomControl created`);

        this.zoomFactor = 1; // 100% zoom

        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc("ipc_ZoomControl");

            this.ipc.on('zoomChange', ({zoomFactor}) => {
                this.zoomFactor = zoomFactor;
                const event = new CustomEvent("zoomFactorChangedFromBrowserSide", { detail: this.zoomFactor });
                document.dispatchEvent(event);
            });
        }
    }
}

export default ZoomControlModel;
