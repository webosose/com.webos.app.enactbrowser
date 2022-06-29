// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

import initLogging from '../../../src/Logger';

class Menu {
    constructor() {
        if (typeof window !== 'undefined') {
            initLogging();
        }
        console.log(`Menu created`);
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc("ipc_menu");
        }
    }

    click(menuItem) {
        console.log(`Menu::click()`);
        this.ipc.post('click', {menuItem: menuItem});
    }

    notifyCreated() {
        this.ipc.post('created', {
            width: 160,
            height: 180
        });
    }
}

export {Menu};
