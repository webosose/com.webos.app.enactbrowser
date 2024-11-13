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

import { applyBounds, applyDeactivate, applySetVisible, applySwitchContent } from "./PageViewAdaptor";
import { UIOverlay } from "./UIOverlay";

class UILayer {
    constructor({ channel, view }) {
        this.channel = channel;
        this.view = view;
        this.contentName = "default";
        this.justCreated = true;

        channel.on("documentSize", ({ contentType, size }) => {
            console.log(`[UIOverlay] UILayer::constructor "documentSize" message(${contentType}, ${size})`);

            UILayer.setBounds({
                bounds: size,
                target: contentType
            });
            this.applyBounds();
        });

        channel.on('setFocusToUIOverlay', () => {
            console.log(`[UIOverlay] UILayer::constructor "setFocusToUIOverlay" message. set focus to UIOverlay`);
        });
    }

    switchContent({ target }) {
        console.log(`[UIOverlay] UILayer::switchContent(${target})`);
        this.contentName = target;
        applySwitchContent({
            target: target,
            ipc: this.channel
        });
    }

    static setBounds({ bounds, target }) {
        const content = target;
        console.log(`[UIOverlay] UILayer::setBounds({${bounds.x}, ${bounds.y}, ${bounds.w}, ${bounds.h}}, ${content})`);
        console.log(UIOverlay.sizes);
        UIOverlay.sizes[content].x = bounds.x || UIOverlay.sizes[content].x;
        UIOverlay.sizes[content].y = bounds.y || UIOverlay.sizes[content].y;
        UIOverlay.sizes[content].w = bounds.w || UIOverlay.sizes[content].w;
        UIOverlay.sizes[content].h = bounds.h || UIOverlay.sizes[content].h;
    }

    applyBounds() {
        applyBounds({
            view: this.view,
            bounds: UIOverlay.sizes[this.contentName]
        });
    }

    setVisible() {
        console.log(`[UIOverlay] UILayer::setVisible()`);

        applySetVisible({
            visible: true,
            view: this.view
        });
    }

    deactivate() {
        applyDeactivate({ view: this.view });
    }
}

export {UILayer};
