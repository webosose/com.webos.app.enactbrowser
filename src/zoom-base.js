// Copyright 2022 LG Electronics, Inc.
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

/*global document*/
/*global window*/

import Ipc from './ipc';

class ZoomControl {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;

        if (typeof window !== 'undefined') {
            this.menuIpc = new Ipc("ipc_ZoomControl");
            this.menuIpc.subscribe('click', () => {
                this.hide();
            });
        }
    }

    showAbove(buttonId, {zoomFactor}) {
        console.log(`show zoom control`);

        let button = document.getElementById(buttonId);
        const buttonHeight = button.offsetHeight + 20;
        const leftBorderWidth = (document.body.clientWidth / 100) * 75;
        const width = 90;

        return this.uioverlay.show({
            target: 'zoom_control', bounds: {
                x: leftBorderWidth,
                y: buttonHeight,
                w: width
            }
        }).then((layer) => layer.view.pageContents.setFocus());
    }

    destroy() {}

    hide() {
        console.log(`hide zoom control`);
        this.uioverlay.hide({target: 'zoom_control'});
    }
}

export default ZoomControl;
export {ZoomControl};
