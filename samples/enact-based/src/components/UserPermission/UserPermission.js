// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
