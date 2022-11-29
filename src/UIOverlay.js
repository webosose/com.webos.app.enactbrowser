// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/
/*global PageView*/
/*global ShellIpc*/

const defaultChannelName = "default";

class UIOverlay {
    static callChain = typeof ShellIpc !== 'undefined'
        ? Promise.resolve(new ShellIpc(`ipc_uioverlay`))
        : null
    static ids = [];
    static instances = [];

    constructor() {
        console.log(`UIOverlay constructor >>>`);

        UIOverlay.instances.push(this);
        if (typeof PageView === 'undefined') {
            return; // in case of prerender
        }

        const createPageView = () => {
            this.view = new PageView({"page-contents-params": {
              "allow-universal-access": true,
              "api": ["v8/browser_shell_ipc"],
              "partition": ""
            }});
            window.shell.shellWindow.pageView.addChildView(this.view);
            this.view.pageContents.loadFile("menu/index.html");
            this.view.pageContents.setPageBaseBackgroundColor('#FFFFFF00');
        }

        // It is for testing purposes
        window.UIOverlay = UIOverlay;

        this.ipcChannelName = defaultChannelName;

        this.callChain = UIOverlay.callChain = UIOverlay.callChain.then((genericIpc) => {
            return new Promise((resolve) => {
                genericIpc.on("created", (ipcChannelName) => {
                    if (!UIOverlay.ids.includes(ipcChannelName) && this.ipcChannelName === defaultChannelName) {
                        console.log(`UIOverlay received new IPC channel name ${ipcChannelName}`);
                        this.ipcChannelName = ipcChannelName;
                        UIOverlay.ids.push(ipcChannelName);
                        this.ipc = new ShellIpc(this.ipcChannelName);
                        console.log(`UIOverlay IPC switched to individual channel named ${this.ipcChannelName}`);
                        resolve(genericIpc);
                    } else {
                        reject(`allready handled channel`);
                    }
                });
                createPageView();
            })
        }).then((genericIpc) => {
            console.log(`UIOverlay:: lets subscribe to onDocumentSize ${this.contentName}`);
            // receive document size from UIOverlay content
            this.ipc.on("documentSize", ({contentType, size}) => {
                console.log(`UIOverlay::onDocumentSize(${contentType})`);
                this.setBounds(size, contentType);
            });
            this.ipc.on('setFocusToUIOverlay', () => {
                console.log(`setFocusToUIOverlay message. set focus to UIOverlay`);
                this.setFocus();
            })
            console.log(`UIOverlay:: subscribed to onDocumentSize`);
            return genericIpc;
        }, (e) => {
            console.log(`catch error: ${e}`);
        });

        if (typeof window !== 'undefined') {
            window.document.addEventListener('mouseover', () => {
                window.shell.shellWindow.pageView.pageContents.setFocus();
            })
        }

        this.contentName = "default";
        this.sizes = [];
        this.sizes["default"] = {x: 10, y: 10, w: 10, h: 10};
        console.log(`UIOverlay constructor <<<`);
    }

    getCallChain() {
        return this.callChain;
    }

    setVisible(visible, target) {
        console.log(`UIOverlay::setVisible(${visible}, ${target})`);

        if (target && target !== this.contentName) {
            return this.callChain;
        }
        return this.callChain.then(() => {
            console.log(`UIOverlay::setVisible(${visible})`);
            if (visible) {
                this.setBounds({});
                this.view.bringToFront();
            } else {
                this.view.sendToBack();
                if (typeof window !== 'undefined') {
                    console.log(`UIOerlay::setVisible setFocus to main window`);
                    window.shell.shellWindow.pageView.pageContents.setFocus();
                }
            }
            this.view.setVisible(visible);
        })
    }

    setFocus() {
        return this.callChain.then(() => {
            console.log(`UIOverlay::setFocus`);
            this.view.pageContents.setFocus();
        })
    }

    setBounds({x, y, w, h}, contentType) {
        return this.callChain.then(() => {
            const content = !!contentType ? contentType : this.contentName;
            console.log(`UIOverlay::setBounds({${x}, ${y}, ${w}, ${h}})`);

            if (!this.sizes[content]) {
                this.sizes[content] = {x: 10, y: 10, w: 10, h: 10};
            }

            this.sizes[content].x = x || this.sizes[content].x;
            this.sizes[content].y = y || this.sizes[content].y;
            this.sizes[content].w = w || this.sizes[content].w;
            this.sizes[content].h = h || this.sizes[content].h;

            if (this.contentName === contentType) {
                console.log(`setBounds(${this.sizes[content].x}, ${this.sizes[content].y}, ${this.sizes[content].w}, ${this.sizes[content].h}, ${content})`);
                this.view.setBounds(
                    Math.round(this.sizes[content].x),
                    Math.round(this.sizes[content].y),
                    Math.round(this.sizes[content].w),
                    Math.round(this.sizes[content].h)
                );
            }
        })
    }

    switchContent(target) {
        console.log(`UIOverlay::switchContent(${target})`);
        return this.callChain.then(() => {
            console.log(`start switchingContent`);

            if (this.contentName === target) {
                return;
            }
            this.contentName = target;

            if (!this.sizes[this.contentName]) {
                this.sizes[this.contentName] = {x: 0, y: 0, w: 0, h: 0};
            }

            console.log(`UIOverlay::switchContent send switch content for (${target})`);
            this.ipc.post("switchContent", {type: target});
        }).then(() => this.setBounds({}));
    }
}

export {UIOverlay};
