// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React from 'react';
import {render} from 'react-dom';
import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';
import App from './App';
import InputSuggestionListModel from './components/InputSuggestionListModel';
import ExitFullscreenButtonModel from './components/ExitFullscreenButtonModel';
import ChromeExtensionsModel from './components/ChromeExtensionsModel';
import MenuModel from './components/MenuModel';
import Ipc from '../../src/Ipc';
import initLogging from '../../src/Logger';

if (typeof window !== 'undefined') {
    initLogging();
}

function makeUniqueId() {
    return Math.random().toString() + Math.random().toString();
}

let genericIpc = new Ipc('ipc_uioverlay');
let ipcChannelName = makeUniqueId();
let ipc;

if (typeof window !== 'undefined') {
    ipc = new Promise((resolve) => {
        resolve(new Ipc(ipcChannelName));
    });
    console.log(`Created IPC channel named ${ipcChannelName}`);

    window.document.addEventListener('mouseover', () => {
        genericIpc.post('setFocusToUIOverlay', {});
    })
}

const model = {
    inputSuggestionList: new InputSuggestionListModel(ipc),
    menu: new MenuModel(),
    ipc: ipc,
    genericIpc: genericIpc,
    exitFullscreenButton: new ExitFullscreenButtonModel(),
    chromeExtensions: new ChromeExtensionsModel()
};

const PrerenderApp = MoonstoneDecorator(<div />);

const appElement = (typeof window !== 'undefined') ?
    (<App model={model} />) :
    (<PrerenderApp />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
    render(appElement, document.getElementById('root'));
}

export default appElement;
