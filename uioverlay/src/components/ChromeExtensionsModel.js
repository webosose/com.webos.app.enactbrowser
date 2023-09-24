// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

class ChromeExtensionsModel {
    constructor() {
        console.log(`ChromeExtensionsModel created`);
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc("ipc_chrome_extensions");
        }
    }

    click(chromeExtensionsItem) {
        return () => {
            console.log(`ChromeExtensionsModel::click()`);
            this.ipc.post('click', {chromeExtensionsItem: chromeExtensionsItem});
        }
    }
}

export default ChromeExtensionsModel;
