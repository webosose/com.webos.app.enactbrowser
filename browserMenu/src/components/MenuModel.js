// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

class MenuModel {
    constructor() {
        console.log(`Menu created`);
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc("ipc_menu");
        }
    }

    click(menuItem) {
        return () => {
            console.log(`Menu::click()`);
            this.ipc.post('click', {menuItem: menuItem});
        }
    }
}

export default MenuModel;
