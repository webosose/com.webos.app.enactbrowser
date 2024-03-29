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

import Ipc from './ipc';

class DialogBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_dialog');
    }

    show(dialogProps, bounds) {
        return this.uioverlay.show({
            target: 'dialog',
            bounds: {
                x: bounds.x,
                y: bounds.y,
                w: bounds.width,
                h: bounds.height
            }
        })
            .then((layer) => {
                layer.channel.once('contentSwitched', (e) => {
                    if (e.type === 'dialog') {
                        this.ipc.post('ipc_dialog', dialogProps);
                    }
                });
            });
    }

    hide() {
        console.log(`DialogBase::dialog`);
        this.uioverlay.hide({target: 'dialog'});
    }
}

export {DialogBase};
