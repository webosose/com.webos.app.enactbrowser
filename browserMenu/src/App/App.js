// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React, { useState, useEffect } from 'react';
import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';

import Menu from './../Views/Menu';
import InputSuggestionList from './../Views/InputSuggestionList';
import ExitFullscreenButton from './../Views/ExitFullscreenButton';

function App({model}) {
    console.log(`App render`);

    const [contentType, setContentType] = useState("default");

    function updateDocumentSize() {
        const element = document.getElementById('app');
        if (element) {
            model.ipc.then((ipc) => {
                console.log(`send document size (${element.clientHeight})`);
                ipc.post('documentSize', {contentType: contentType, size: {h: element.clientHeight}});
            });
        }
    }

    useEffect(updateDocumentSize);
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

    switch(contentType) {
        case 'input_suggestion_list':
            return <InputSuggestionList model={model.inputSuggestionList} onUpdate={updateDocumentSize}/>;

        case 'browser_menu':
            return <Menu model={model.menu}/>;

        case 'exit_fullscreen_button':
            return <ExitFullscreenButton model={model.exitFullscreenButton}/>;

        default:
            return <div/>;
    }
}

export default MoonstoneDecorator(App);
