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

import {useEffect, useState} from 'react';
import mic from '../../../assets/default/user_permission_mic.svg';
import camera from '../../../assets/default/user_permission_camera.svg';
import geolocation from '../../../assets/default/user_permission_location.svg';

const permissionList = {
    'camera': {
        label: 'Use your camera',
        icon: camera
    },
    'geolocation': {
        label: 'Know your location',
        icon: geolocation
    },
    'mic': {
        label: 'Use your microphone',
        icon: mic
    },
};

function UserPermission({ userPermission }) {
    const [isOpened, setIsOpened] = useState(false);

    const detectMedia = (ev, ev1 = []) => {
        console.log('detected media details are...==>', ev, ev1);
        // Prevent the permission popup shown if ev1 does not contain any predefined permissions.
        const requestedPermissionList = ev1.filter((num) => permissionList[num]);
        if (requestedPermissionList.length) {
            setIsOpened(true);
            userPermission.show({
                domain: ev,
                permissions: requestedPermissionList,
            });
        }
    };

    useEffect(() => {
        // Check if the feature is available in some cases, for example, Apollo
        if (typeof window.navigator.userpermission !== 'undefined') {
            // Event listener 'detectMedia' function is registered for listening to media detection event.
            window.navigator.userpermission.onshowprompt = detectMedia;

            const onSubmit = (data) => {
                userPermission.hide();
                window.navigator.userpermission.onpromptresponse(data);
            };

            userPermission.ipc.ipcObject.on('submit', onSubmit);
            return () => {
                userPermission.ipc.ipcObject.removeEventListener('submit', onSubmit);
            };
        }
    }, []);

    useEffect(() => {
        if (isOpened) {
            window.document.addEventListener('click', () => {
                if (isOpened) {
                    setIsOpened(false);
                }
            }, {once: true});
        }
        else {
            userPermission.hide();
        }
    });

    return (<div />); // jshint ignore:line
}

export default UserPermission;
export {permissionList};
