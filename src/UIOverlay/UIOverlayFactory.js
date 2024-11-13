// Copyright 2023 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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
