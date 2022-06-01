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
    constructor() {
        this.menuPopupView = null;
        this.ipc = new Ipc("ipc_menu");
        this.width = 0;
        this.height = 0;
    }

    create() {
        console.log(`create browser menu`);
        if (!this.menuPopupView) {
            this.menuPopupView = new PageView;
            this.menuPopupView.pageContents = new PageContents({
                "api": ["v8/browser_shell_ipc"]
            });
            this.menuPopupView.pageContents.setPageBaseBackgroundColor('#FFFFFF11');
        }
        window.shell.shellWindow.pageView.addChildView(this.menuPopupView);
        this.menuPopupView.setBounds(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
        // Current impl on Browser Shell do not support relative file paths
        // loadURL and absolute path will be replaced with loadFile(<rel path>) when it will be implemented in Browser Shell
        this.menuPopupView.pageContents.loadFile("menu/index.html");

        this.ipc.subscribe("created", (({width, height}) => {
            console.log(`menu created (${width}, ${height})`);

            // calculate position
            // and set position of  this.menuPopupView
            const rect = this.menuPopupView.getBounds();
            rect.width = width;
            rect.height = height;
            console.log(`nevaBrowserMenu set size(width:${rect.width}, height:${rect.height})`);
            this.menuPopupView.setBounds(rect.x, rect.y, rect.width, rect.height);
        }).bind(this));
        this.hide();
    }

    showAbove(buttonId) {
        console.log(`show browser menu`);
        let button = document.getElementById(buttonId);
        const buttonRect = button.getBoundingClientRect();
        let menuRect = this.menuPopupView.getBounds();

        const menuHalf = menuRect.width / 2;
        const buttonHalf = buttonRect.width / 2;

        menuRect.x = (buttonRect.x + buttonHalf) - menuHalf;
        menuRect.y = buttonRect.y + buttonRect.height;

        window.shell.shellWindow.pageView.addChildView(this.menuPopupView);
        console.log(`nevaBrowserMenu set position(x:${menuRect.x}, y:${menuRect.y})`);
        this.menuPopupView.setBounds(Math.round(menuRect.x), Math.round(menuRect.y), menuRect.width, menuRect.height);
        this.menuPopupView.bringToFront();
        this.menuPopupView.setVisible(true);
    }

    destroy() {
        if (this.menuPopupView) {
            window.shell.shellWindow.pageView.removeChildView(this.menuPopupView);
        }
    }

    hide() {
        console.log(`hide browser menu`);
        this.menuPopupView.setVisible(false);
    }

};

export default Menu;
export {Menu};
