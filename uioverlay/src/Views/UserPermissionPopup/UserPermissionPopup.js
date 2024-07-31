// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {useEffect, useState} from 'react';
import Icon from '@enact/agate/Icon';
import Button from '@enact/agate/Button';
import $L from '@enact/i18n/$L';

import {permissionList} from '../../../../samples/enact-based/src/components/UserPermission/UserPermission';

import css from './UserPermissionPopup.module.less';

function UserPermissionPopup({model, onUpdate}) {
    const [domain, setDomain] = useState('');
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        document.addEventListener('updatePermissionEvent', (ev) => {
            const {domain, permissions: requestPermissions} = ev.detail; // ev.detail.permissions = [3,8,11]
            const items = requestPermissions.map(num => permissionList[num]);
            setDomain(domain);
            setPermissions(items);
        });
    });

    useEffect(onUpdate, [model, onUpdate, permissions]);

    return (
        <div className={css.notificationPopup}>
            <div className={css.header}>
                <label className={css.title}>{domain} wants to</label>
                <Icon
                    onClick={model.submit(3)}
                    className={css.closeIcon} css={css}
                >closex</Icon>
            </div>
            {permissions.map((item, i) => item ? (
                <div key={`permission_item-${i}`} className={css.item}>
                    <span className={css.icon}><img src={item.icon} /></span>
                    {item.label}
                </div>
            ) : null)}
            <div className={css.buttonGrp}>
                <Button className={css.button} onClick={model.submit(1)}>{$L('Allow')}</Button>
                <Button className={css.button} onClick={model.submit(2)}>{$L('Block')}</Button>
            </div>
        </div>
    );
}

export default UserPermissionPopup;
