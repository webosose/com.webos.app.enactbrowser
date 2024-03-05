// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import { useState, useEffect, useCallback } from 'react';

import Item from '@enact/agate/Item';
import $L from '@enact/i18n/$L';

import css from './ChromeExtensions.module.less'

function ChromeExtensions({model, onUpdate}) {
    let items = [];
    const [extensions, setExtensions] = useState([{
        id: "-1",
        name: "there are no extensions"
    }]);

    useEffect(onUpdate, [extensions, onUpdate]);
    useEffect(() => {
        console.log(`subscribe to extenstionListUpdated`);
        model.ipc.on('extenstionsListUpdated', (extensionsList) => {
            console.log(`arrived extensions: ${extensionsList}`);
            setExtensions(extensionsList);
        })
    }, [setExtensions, model.ipc]);

    const onclick = useCallback((extension_id) => () => {
        model.ipc.post('click', {id: extension_id})
        // subscribe to this message to handle clicks in main browser pageContents
    }, [model.ipc])

    for (let i = 0; i < extensions.length; i++) {
        if (extensions[i].name === 'PDF Viewer') continue; // Hide PDF extension
        items.push(
            <Item className={css.Item} key={i} onClick={onclick(extensions[i].id)}
            >
                {`${$L(extensions[i].name)}`}
            </Item>
        );
    }
    console.log(`render chromeExtensionsMenu`);
    return (<div className={css.itemsContainer}>{items}</div>);
}

export default ChromeExtensions;
