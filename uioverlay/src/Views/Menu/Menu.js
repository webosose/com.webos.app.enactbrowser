// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import Item from '@enact/moonstone/Item';
import React from 'react';
import $L from '@enact/i18n/$L';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react';
import { selectDevSettings, set } from '../../store/slice/menu/devSettingsSlice'

import css from './Menu.module.less';

function Menu({model, onUpdate}) {
    const dispatch = useDispatch();
    const showDevSettings = useSelector(selectDevSettings);

    useEffect(() => {
        model.ipc.on('showDevSettings', ({showDevSettingsItem}) => {
            console.log(`showDevSettings message arrived ${showDevSettingsItem}`);
            dispatch(set(showDevSettingsItem));
        });
    }, []);

    const [items, setItems] = useState([
        {message: 'history', text: 'History'},
        {message: 'bookmarks', text: 'Bookmarks'},
        {message: 'settings', text: 'Settings'}]);

    useEffect(() => {
        if (showDevSettings === true) {
            if (!items.find((item) => item.message === 'devSettings')) {
                setItems([...items, {message: 'devSettings', text: 'Dev Settings'}]);
            }
        } else {
            setItems(items.filter(item => item.message !== 'devSettings'));
        }
    }, [showDevSettings])

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

    useEffect(onUpdate, [renderItems, items, showDevSettings])

    return (
        <div id="app" className={css.topArea}>
            {renderItems}
        </div>
    );
}

export default Menu;
