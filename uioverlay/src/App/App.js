// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import { useState, useEffect, useCallback } from 'react';

import Menu from '../Views/Menu';
import InputSuggestionList from '../Views/InputSuggestionList';
import ExitFullscreenButton from '../Views/ExitFullscreenButton';
import ChromeExtensions from '../Views/ChromeExtensions';
import Dialog from '../Views/Dialog';
import ZoomControlMenu from '../Views/ZoomControlMenu';
import UserPermissionPopup from '../Views/UserPermissionPopup';
import BookmarkDialog from '../Views/BookmarkDialog/BookmarkDialog';
import BlockedPopup from '../Views/BlockedPopup';
import AppDecorator from '../../../samples/enact-based/src/components/AppDecorator'
import ThemeDecorator from '@enact/agate/ThemeDecorator';

function App({model}) {
    console.log(`App render`);

    const [contentType, setContentType] = useState("default");

    const updateDocumentSize = useCallback(() => {
        const element = document.getElementById('app');
        if (element) {
            model.ipc.then((ipc) => {
                let windowHeight = element.getBoundingClientRect().height + element.getBoundingClientRect().y;
                if (contentType === 'exit_fullscreen_button') {
                    windowHeight *= 2;
                }
                console.log(`send document height (${windowHeight})`);
                ipc.post('documentSize', {contentType: contentType, size: {h: windowHeight}});
            });
        }
    }, [contentType, model.ipc]);

    useEffect(() => {
        if (contentType !== "dialog") {
            updateDocumentSize()
        }
    });
    useEffect(() => {
        model.ipc.then((ipc) => {
            console.log(`subscribe to switchContent`);
            ipc.subscribe('switchContent', ({type}) => {
                console.log(`switch content to ${type}`);
                setContentType(type);
            })
        });
    }, [model.genericIpc, model]);

    let content;
    switch(contentType) {
        case 'input_suggestion_list':
            content = (<InputSuggestionList model={model.inputSuggestionList} onUpdate={updateDocumentSize}/>);
            break;

        case 'zoom_control':
            content = (<ZoomControlMenu model={model.zoomControl} onUpdate={updateDocumentSize}/>);
            break;

        case 'browser_menu':
            content = (<Menu model={model.menu} onUpdate={updateDocumentSize}/>);
            break;

        case 'exit_fullscreen_button':
            content = (<ExitFullscreenButton model={model.exitFullscreenButton}/>);
            break;

        case 'chrome_extensions':
            content = (<ChromeExtensions model={model.chromeExtensions} onUpdate={updateDocumentSize}/>);
            break;

        case 'dialog':
            content = (<Dialog model={model.dialog}/>);
            break;

        case 'user_permission':
            content = (<UserPermissionPopup model={model.userPermission} onUpdate={updateDocumentSize}/>);
            break;

        case 'bookmark_dialog':
            content = (<BookmarkDialog model={model.bookmarkDialog} onUpdate={updateDocumentSize}/>);
            break;

        case 'blocked_popup':
            content = (<BlockedPopup model={model.blockedPopup} onUpdate={updateDocumentSize}/>);
            break;

        default:
            content = (<div />);
            break;
    }

    return (
        <div id="app">
            {content}
        </div>
    )
}

export default AppDecorator(ThemeDecorator({i18n: false}, App));
