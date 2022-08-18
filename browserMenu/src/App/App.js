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

function App({model}) {
    console.log(`App render`);

    function updateDocumentSize() {
        const element = document.getElementById('app');
        if (element) {
            console.log(`send document size (${element.clientHeight})`);
            model.ipc.post('documentSize', {h: element.clientHeight});
        }
    }

    const [contentType, setContentType] = useState("default");
    useEffect(updateDocumentSize);
    useEffect(() => {
        model.ipc.subscribe('switchContent', ({type}) => {
            console.log(`switch content to ${type}`);
            setContentType(type);
        });
    }, []);

    switch(contentType) {
        case 'input_suggestion_list':
            return <InputSuggestionList model={model.inputSuggestionList} onUpdate={updateDocumentSize}/>;

        case 'browser_menu':
            return <Menu model={model.menu}/>;

        default:
            return <div/>;
    }
}

export default MoonstoneDecorator(App);
