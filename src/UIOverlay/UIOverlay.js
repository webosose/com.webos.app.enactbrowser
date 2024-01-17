// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import { UIOverlayFactory } from "./UIOverlayFactory";
import { UILayer } from "./UILayer";
import { Task, TaskRunner } from "./TaskRunner";

class UIOverlay {
    /* jshint ignore:start */
    static layers = new Map();
    static sizes = [];
    /* jshint ignore:end */

    constructor() {
        ["default", "dialog", "chrome_extensions", "exit_fullscreen_button",
            "browser_menu", "zoom_control", "input_suggestion_list", "user_permission",
            "blocked_popup", "bookmark_dialog"]
            .forEach(element => {
                UIOverlay.sizes[element] = { x: 0, y: 0, w: 10, h: 10 };
            });
        this.taskRunner = new TaskRunner();
    }

    isLayerExists({ target }) {
        console.log(`UIOverlay.layers = `, !!UIOverlay.layers.get(target));
        return !!UIOverlay.layers.get(target);
    }

    show({ target, bounds }) {
        // it is for prerender
        if (typeof ShellIpc === "undefined")
            return Promise.rejected();

        const waitForSwitchContent = (layer) => {
            console.log(`[UIOverlay][showhide] show ${target} >>>`);
                layer.switchContent({ target: target });
                return new Promise((resolve) => {
                    layer.channel.on('switchContentReady', () => {
                        console.log(`[UIOverlay] on switchContentReady`);
                        UIOverlay.layers.set(target, layer);
                        resolve(layer);
                    });
                });
        };

        const initLayer = (layer) => {
            console.log(`${target} layer created`);

            if (bounds) {
                this.setBounds({ bounds, target });
            }

            layer.applyBounds();
            layer.setVisible({ target: target });
            window.shell.shellWindow.pageView.bringToFront(layer.view);
            return layer;
        };

        const hideExclusiveLayers = () => {
            // hide other mutually exclusive layers
            const exclusiveLayers = ["chrome_extensions", "browser_menu", "zoom_control",
                "input_suggestion_list", "user_permission", "blocked_popup", "bookmark_dialog"];
            if (exclusiveLayers.includes(target)) {
                const promisifiedHideFunctions = exclusiveLayers
                    .filter(t => t !== target && this.isLayerExists({ target: t }))
                    .map(t => () => new Promise((resolve, reject) => {
                        this.hide({ target: t })
                            .then(() => resolve())
                            .catch(() => reject());
                    }));

                promisifiedHideFunctions.map(f => this.taskRunner.addFunc(f));
            }
        };

        return new Promise(showFinished => {
            const finish = () => new Promise(resolve => {
                console.log(`[UIOverlay][showhide] show ${target} <<<`);
                showFinished(UIOverlay.layers.get(target));
                resolve();
            });

            const taskFunc = () => new Promise(taskFuncResolve => {
                if (this.isLayerExists({ target })) {
                    const layer = UIOverlay.layers.get(target);
                    layer.justCreated = false;
                    taskFuncResolve(layer);
                    return;
                }

                UIOverlayFactory.getInstance().createLayer()
                    .then(waitForSwitchContent)
                    .then(initLayer)
                    .then(hideExclusiveLayers)
                    .then(() => taskFuncResolve(UIOverlay.layers.get(target)));
            });

            this.taskRunner.addFunc(taskFunc);
            this.taskRunner.addFunc(finish);
        });
    }

    hide({ target }) {
        const hidePromise = new Promise((resolve) => {
            console.log(`[UIOverlay][showhide] hide ${target} >>>`);
            if (this.isLayerExists({target})) {
                const layer = UIOverlay.layers.get(target);
                layer.deactivate();
                UIOverlay.layers.delete(target);
            } else {
                console.log(`UIOverlay::hide called, but there is no layer for target ${target}`);
            }
            console.log(`[UIOverlay][showhide] hide ${target} <<<`);
            resolve();
        });

        this.taskRunner.addFunc(() => hidePromise);
        return hidePromise;
    }

    getLayer({ target }) {
        return UIOverlay.layers.get(target);
    }

    setBounds({ bounds, target }) {
        UILayer.setBounds({bounds, target});

        this.taskRunner.addFunc(() => new Promise((resolve) => {
            console.log(`[UIOverlay] setBounds >>>`);
            if (this.isLayerExists({ target })) {
                const layer = UIOverlay.layers.get(target);
                layer.applyBounds();
            }
            console.log(`[UIOverlay] setBounds <<<`);
            resolve();
        }));
    }
}

if (typeof window !== 'undefined') {
    window.UIOverlay = UIOverlay;
}

export { UIOverlay };
