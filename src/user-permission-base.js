// Copyright 2024 LG Electronics, Inc.
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

import Ipc from './ipc.js';

class UserPermissionBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.ipc = new Ipc('ipc_user_permission');
    }

    show(permissionProps) {
        const inputElem = document.getElementById('omniboxInput'),
            h = inputElem ? inputElem.offsetHeight + 28 : 20,
            cw = document.body.clientWidth / 100,
            l = cw * 10,
            w = cw * 15;

        return this.uioverlay.show({
            target: 'user_permission',
            bounds: {
                x: l,
                y: h,
                w: w,
            }
        })
            .then((layer) => {
                if (layer.justCreated) {
                    layer.channel.on('contentSwitched', (e) => {
                        if (e.type === 'user_permission') {
                            this.ipc.post('updatePermission', permissionProps);
                        }
                    });
                } else {
                    this.ipc.post('updatePermission', permissionProps);
                }
                layer.view.pageContents.setFocus();
                return layer;
            });
    }

    hide() {
        console.log('UserPermissionBase::hide');
        this.uioverlay.hide({target: 'user_permission'});
    }
}

export default UserPermissionBase;
export {UserPermissionBase};
