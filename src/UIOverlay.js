// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/
/*global PageView*/

import {Ipc} from 'js-browser-lib/Ipc';

class UIOverlay {
    constructor(parentFrame) {
        console.log(`UIOverlay constructor`);

        if (typeof PageView === 'undefined') {
            return; // in case of prerender
        }

        this.view = new PageView({page_contents_params: {
            visible: false,
            "api": ["v8/browser_shell_ipc"]}});
        window.shell.shellWindow.pageView.addChildView(this.view);
        this.view.pageContents.setPageBaseBackgroundColor('#FFFFFF00');

        // It is for testing purposes
        window.UIOverlay = UIOverlay;

        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;

        this.ipc = new Ipc("ipc_uioverlay");

        // receive document size from UIOverlay content
        this.ipc.subscribe("documentSize", ({width, height}) => {
            this.width = width || this.width;
            this.height = height || this.height;
            this.view.setBounds(Math.round(this.x), Math.round(this.y), Math.round(this.width), Math.round(this.height));
        });
        this.contentName = "";
    }

    setVisible(visible) {
        console.log(`UIOverlay::setVisible(${visible})`);
        if (visible) {
            this.view.bringToFront();
        } else {
            this.view.sendToBack();
        }
        this.view.setVisible(visible);
        console.trace();
    }

    setPosition(x, y) {
        console.log(`UIOverlay::setPosition(${x}, ${y})`);
        this.x = x;
        this.y = y;
        this.view.setBounds(Math.round(this.x), Math.round(this.y), Math.round(this.width), Math.round(this.height));
    }

    setBounds(x, y, w, h) {
        console.log(`UIOverlay::setBounds(${x}, ${y}, ${w}, ${h})`);
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.view.setBounds(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    switchContent(target) {
        console.log(`UIOverlay::switchContent(${target})`);

        if (this.contentName === target) {
            return;
        }
        this.contentName = target;

        switch(target) {
            case "exit_fullscreen_button":
                this.view.pageContents.loadFile("exitbtn/index.html")
                break;

            case "browser_menu":
                this.view.pageContents.loadFile("menu/index.html");
                break;

            case "input_suggestion_list":
                this.view.pageContents.loadFile("menu/index.html");
                break;
        }
    }
}

export {UIOverlay};
