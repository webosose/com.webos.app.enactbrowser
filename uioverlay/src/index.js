// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {render} from 'react-dom';
import ThemeDecorator from '@enact/agate/ThemeDecorator';
import App from './App';
import InputSuggestionListModel from './components/InputSuggestionListModel';
import ExitFullscreenButtonModel from './components/ExitFullscreenButtonModel';
import ZoomControlModel from './components/ZoomControlModel';
import ChromeExtensionsModel from './components/ChromeExtensionsModel';
import MenuModel from './components/MenuModel';
import createDialogModel from './components/DialogModel';
import Ipc from '../../src/Ipc';
import {initLogging} from 'js-browser-lib/Logger';
import AppDecorator from '../../samples/enact-based/src/components/AppDecorator'

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
}

const model = {
    inputSuggestionList: new InputSuggestionListModel(ipc),
    menu: new MenuModel(),
    ipc: ipc,
    genericIpc: genericIpc,
    exitFullscreenButton: new ExitFullscreenButtonModel(),
    chromeExtensions: new ChromeExtensionsModel(),
    dialog: createDialogModel(),
    zoomControl: new ZoomControlModel()
};

const PrerenderApp = AppDecorator(ThemeDecorator({i18n: false}, <div />));

const appElement = (typeof window !== 'undefined') ? (
    <App model={model} />
) : (<PrerenderApp />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
    render(appElement, document.getElementById('root'));
}

export default appElement;
