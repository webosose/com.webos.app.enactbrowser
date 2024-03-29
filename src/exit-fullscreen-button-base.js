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

/*global ShellIpc*/
/*global window*/

class ExitFullscreenButtonBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        if (typeof window !== 'undefined') {
            this.ipc = new ShellIpc('ipc_FullScreenControl');
        }
    }

    show() {
        console.log(`ExitFullscreenButtonBase::showExitFullscreenButton`);

        const button_width = 260;

        return this.uioverlay.show({
            target: 'exit_fullscreen_button', bounds: {
                x: (window.innerWidth / 2) - (button_width / 2),
                y: 20,
                w: button_width,
                h: 130
            }
        });
    }

    hide() {
        console.log(`ExitFullscreenButtonBase::hideExitFullscreenButton`);
        this.uioverlay.hide({target: 'exit_fullscreen_button'});
    }
}

export {ExitFullscreenButtonBase};
