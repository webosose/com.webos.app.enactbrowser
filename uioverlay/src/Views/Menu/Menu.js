// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import Item from '@enact/agate/Item';
import $L from '@enact/i18n/$L';
import { useEffect, useState } from 'react';

import css from './Menu.module.less';

function Menu({model, onUpdate}) {
    const [showDevSettings, setShowDevSettings] = useState(false);

    useEffect(() => {
        const handler = ({showDevSettingsItem}) => {
            console.log(`showDevSettings message arrived ${showDevSettingsItem}`);
            setShowDevSettings(showDevSettingsItem);
        };
        model.ipc.on('showDevSettings', handler);
        return () => model.ipc.removeEventListener('showDevSettings', handler);
    }, [model.ipc]);

    let items = [
        {message: 'history', text: 'History'},
        {message: 'bookmarks', text: 'Bookmarks'},
        {message: 'settings', text: 'Settings'}
    ];

    if (showDevSettings === true) {
        items = [...items, {message: 'devSettings', text: 'Dev Settings'}];
    } else {
        items = items.filter(item => item.message !== 'devSettings');
    }

    console.log(items)

    const renderItems = items.map((element, index) => (
        <Item
            key={index}
            minWidth={false}
            className={css.menuItem}
            onClick={model.click(element.message)}
        >
            {$L(element.text)}
        </Item>
    ));

    useEffect(onUpdate, [renderItems, items, showDevSettings, onUpdate])

    return (
        <div id="app" className={css.topArea}>
            {renderItems}
        </div>
    );
}

export default Menu;
