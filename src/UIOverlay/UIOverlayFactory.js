// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

import { createView } from "./PageViewAdaptor";
import { UILayer } from "./UILayer";

class UIOverlayFactory {
    /* jshint ignore:start */
    static genericIpc = (typeof window) !== 'undefined' ? new ShellIpc(`ipc_uioverlay`) : null;
    static callChain = Promise.resolve();
    static instance = null;
    static channels = [];
    /* jshint ignore:end */

    constructor() {
        console.log(`[UIOverlayFactory] instance created`);
    }

    static getInstance() {
        if (!UIOverlayFactory.instance) {
            UIOverlayFactory.instance = new UIOverlayFactory();
        }
        return UIOverlayFactory.instance;
    }

    static addToCallChain(p) {
        return UIOverlayFactory.callChain = UIOverlayFactory.callChain.then(() => p); //jshint ignore:line
    }

    createLayer() {
        return UIOverlayFactory.callChain = UIOverlayFactory.callChain.then(() => { //jshint ignore:line
            return new Promise((resolve) => {
                UIOverlayFactory.genericIpc.once("created", function(channelName) {
                    console.log(`[UIOverlay] UIOverlayFactory::constructor "created" message `, channelName);
                    const ipc = new ShellIpc(channelName);

                    resolve(new UILayer({
                        channel: ipc,
                        view
                    }));
                });

                const view = createView();

            });
        }).then((layer) => {
            console.log(`[UIOverlay] UIOverlayFactory::createLayer send "ready"`);
            layer.channel.post("ready", {});
            return layer;
        });
    }
}

export {UIOverlayFactory};
