// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React, { useState, useEffect, useCallback } from 'react';
import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';

import Menu from './../Views/Menu';
import InputSuggestionList from './../Views/InputSuggestionList';
import ExitFullscreenButton from './../Views/ExitFullscreenButton';
import ChromeExtensions from './../Views/ChromeExtensions';
import Dialog from './../Views/Dialog';

function App({model}) {
    console.log(`App render`);

    const [contentType, setContentType] = useState("default");

    const updateDocumentSize = useCallback(() => {
        const element = document.getElementById('app');
        if (element) {
            model.ipc.then((ipc) => {
                console.log(`send document size (${element.offsetHeight})`);
                ipc.post('documentSize', {contentType: contentType, size: {h: element.offsetHeight}});
            });
        }
    }, [contentType]);

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
            model.genericIpc.post('created', ipc.ipcObject.channel);
        });
    }, []);

    let content;
    switch(contentType) {
        case 'input_suggestion_list':
            content = (<InputSuggestionList model={model.inputSuggestionList} onUpdate={updateDocumentSize}/>);
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

export default MoonstoneDecorator(App);
