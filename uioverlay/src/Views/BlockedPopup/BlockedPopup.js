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
import Icon from '@enact/agate/Icon';
import Button from '@enact/agate/Button';
import $L from '@enact/i18n/$L';

import css from './BlockedPopup.module.less';

function BlockedPopup({model, onUpdate}) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        const handler = (ev) => {
            if (ev.detail && ev.detail.targetUrl) {
                setUrl(ev.detail.targetUrl);
            }
        };

        document.addEventListener('updateBlockedPopupEvent', handler);
        return () => {
            document.removeEventListener('updateBlockedPopupEvent', handler);
        };
    }, []);

    useEffect(onUpdate, [model, onUpdate, url]);

    return (
        <div className={css.notificationPopup}>
            <div className={css.header}>
                <label className={css.title}>Popup blocked:</label>
                <Icon
                    onClick={model.submit(false)}
                    className={css.closeIcon} css={css}
                >closex</Icon>
            </div>
            <p>Always allow pop-ups and redirect to {url}</p>
            <div className={css.buttonGrp}>
                <Button className={css.button} onClick={model.submit(true)}>{$L('Allow')}</Button>
                <Button className={css.button} onClick={model.submit(false)}>{$L('Block')}</Button>
            </div>
        </div>
    );
}

export default BlockedPopup;
