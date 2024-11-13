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

import Ipc from './Ipc.js';

class ChromeExtensionsBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;

        if (typeof window !== 'undefined') {
            this.ipc = new Ipc("ipc_chrome_extensions");
            this.ipc.subscribe('click', () => {
                this.hide();
                if (typeof window !== 'undefined') {
                    window.shell.shellWindow.pageView.pageContents.setFocus();
                }
            });
        }
    }

    showAbove(button, partition) {
        console.log(`show chrome extensions menu`);
        const buttonHeight = button.offsetHeight + 20;
        const leftBorderWidth = (document.body.clientWidth / 100) * 70;  // 10% of the document width
        const width = document.body.clientWidth - leftBorderWidth;
        const extensionsService = window.nevaExtensionsManager.getExtensionsServiceFor(partition);

        return this.uioverlay.show({
            target: 'chrome_extensions', bounds: {
                x: leftBorderWidth,
                y: buttonHeight,
                w: width
            }
        }).then((layer) => {
            layer.view.pageContents.setFocus();
            return new Promise((resolve) => {
                if (typeof extensionsService !== 'undefined'){
                    extensionsService.getExtensionsInfo((infos) => {
                        console.log(JSON.stringify(infos));
                        this.ipc.post('extenstionsListUpdated', infos);
                        resolve();
                    });
                }
            });
        });
    }

    destroy() {}

    hide() {
        console.log(`hide chrome extensions menu`);
        return this.uioverlay.hide({target: 'chrome_extensions'});
    }

}

export default ChromeExtensionsBase;
export {ChromeExtensionsBase};
