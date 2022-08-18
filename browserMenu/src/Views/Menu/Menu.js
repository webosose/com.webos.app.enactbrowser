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

import css from './Menu.less';

function Menu({model}) {
    return (
        <div id="app" className={css.topArea}>
            <Item
                minWidth={false}
                className={css.menuItem}
                onClick={model.click('history')}
            >
                {$L('History')}
            </Item>
            <Item
                minWidth={false}
                onClick={model.click('bookmarks')}
            >
                {$L('Bookmarks')}
            </Item>
            <Item
                minWidth={false}
                className={css.menuItem}
                onClick={model.click('settings')}
            >
                {$L('Settings')}
            </Item>
            <Item
                minWidth={false}
                className={css.menuItem}
                onClick={model.click('devSettings')}
            >
                {$L('Dev Settings')}
            </Item>
        </div>
    );
}

export default Menu;
