// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React from 'react';
import {render} from 'react-dom';
import App from './App';
import InputSuggestionListModel from './components/InputSuggestionListModel';
import MenuModel from './components/MenuModel';
import Ipc from '../../src/Ipc';
import initLogging from '../../src/Logger';

if (typeof window !== 'undefined') {
    initLogging();
}

const model = {
    inputSuggestionList: new InputSuggestionListModel(),
    menu: new MenuModel(),
    ipc: new Ipc('ipc_uioverlay')
};

const appElement = (typeof window !== 'undefined') ? (<App model={model} />) : (<div />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
    render(appElement, document.getElementById('root'));
}

export default appElement;
