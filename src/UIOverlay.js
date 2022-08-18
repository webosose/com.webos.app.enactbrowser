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
        this.ipc.subscribe("documentSize", (size) => {
            console.log(`UIOverlay::onDocumentSize`);
            this.setBounds(size);
        });
        this.contentName = "default";
        this.view.pageContents.loadFile("menu/index.html");
        this.sizes = [];
        this.sizes["default"] = {x: 0, y: 0, w: 0, h: 0};
    }

    setVisible(visible) {
        console.log(`UIOverlay::setVisible(${visible})`);
        if (visible) {
            this.setBounds({});
            this.view.bringToFront();
        } else {
            this.view.sendToBack();
        }
        this.view.setVisible(visible);
    }

    setBounds({x, y, w, h}) {
        this.sizes[this.contentName].x = x || this.sizes[this.contentName].x;
        this.sizes[this.contentName].y = y || this.sizes[this.contentName].y;
        this.sizes[this.contentName].w = w || this.sizes[this.contentName].w;
        this.sizes[this.contentName].h = h || this.sizes[this.contentName].h;

        this.view.setBounds(
            Math.round(this.sizes[this.contentName].x), 
            Math.round(this.sizes[this.contentName].y), 
            Math.round(this.sizes[this.contentName].w), 
            Math.round(this.sizes[this.contentName].h)
        );
    }

    switchContent(target) {
        if (this.contentName === target) {
            return;
        }
        this.contentName = target;

        if (!this.sizes[this.contentName]) {
            this.sizes[this.contentName] = {x: 0, y: 0, w: 0, h: 0};
        }

        console.log(`UIOverlay::switchContent(${target})`);
        this.ipc.post("switchContent", {type: target});
    }
}

export {UIOverlay};
