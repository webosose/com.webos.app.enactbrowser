// Copyright 2022 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

import {render} from 'react-dom';
import ThemeDecorator from '@enact/agate/ThemeDecorator';
import App from './App';
import InputSuggestionListModel from './components/input-suggestion-list-model';
import ExitFullscreenButtonModel from './components/exit-fullscreen-button-model';
import ZoomControlModel from './components/zoom-control-model';
import ChromeExtensionsModel from './components/chrome-extensions-model';
import MenuModel from './components/menu-model';
import createDialogModel from './components/dialog-model';
import UserPermissionModel from './components/user-permission-model';
import BookmarkDialogModel from './components/bookmark-dialog-model';
import BlockedPopup from './components/blocked-popup-model';
import Ipc from 'js-browser-lib/ipc';
import {initLogging} from 'js-browser-lib/logger';
import AppDecorator from '../../samples/enact-based/src/components/AppDecorator';

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
        const channel = new Ipc(ipcChannelName);
        channel.ipcObject.on("ready", () => {
            console.log("ready message");
            resolve(channel);
        });

        genericIpc.post('created', ipcChannelName);
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
    zoomControl: new ZoomControlModel(),
    userPermission: new UserPermissionModel(),
    bookmarkDialog: new BookmarkDialogModel(),
    blockedPopup: new BlockedPopup(),
};

const PrerenderApp = AppDecorator(ThemeDecorator(<div />));

const appElement = (typeof window !== 'undefined') ? (
    <App model={model} />
) : (<PrerenderApp />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
    render(appElement, document.getElementById('root'));
}

export default appElement;
