// Copyright 2018 LG Electronics, Inc.
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

import {Provider} from 'react-redux';
import {render} from 'react-dom';

import App from './App';
import configureStore from 'js-browser-lib/ReduxComponents/store';
import {UIOverlay} from 'js-browser-lib/UIOverlay/UIOverlay';
import {ExitFullscreenButtonBase} from 'js-browser-lib/ExitFullscreenButtonBase';
import {Menu as MenuBase} from 'js-browser-lib/MenuBase';
import {ChromeExtensionsBase} from 'js-browser-lib/ChromeExtensionsBase';
import {DialogBase} from 'js-browser-lib/DialogBase';
import {initLogging} from 'js-browser-lib/Logger';
import {isWindowReady} from '@enact/core/snapshot';
import {ZoomControl as ZoomControlBase} from 'js-browser-lib/ZoomBase'
import {UrlSuggestionsBase} from 'js-browser-lib/UrlSuggestionsBase';
import {UserPermissionBase} from 'js-browser-lib/UserPermissionBase';
import {BookmarkDialogBase} from 'js-browser-lib/BookmarkDialogBase';
import {BlockedPopupBase} from 'js-browser-lib/BlockedPopupBase';

if (typeof window !== 'undefined') {
	initLogging();
}

const store = configureStore();
const uioverlay = new UIOverlay();
const menu = new MenuBase(uioverlay);
const zoomControl = new ZoomControlBase(uioverlay);
const exitFullscreenButton = new ExitFullscreenButtonBase(uioverlay);
const chromeExtensionsMenu = (isWindowReady() && typeof window.nevaExtensionsManager !== 'undefined') ? new ChromeExtensionsBase(uioverlay) : null;
const dialog = new DialogBase(uioverlay);
const urlSuggestionsBar = new UrlSuggestionsBase(uioverlay);
const userPermission = new UserPermissionBase(uioverlay);
const bookmarkDialog = new BookmarkDialogBase(uioverlay);
const blockedPopup = new BlockedPopupBase(uioverlay);

if (typeof window !== 'undefined') {
	window.dialogOverlay = dialog;
	window.urlSuggestionsBar = urlSuggestionsBar;
}


let appElement = (
	<Provider store={store}>
		<App store={store}
			uioverlay={uioverlay}
			menu={menu}
			zoomControl={zoomControl}
			exitFullscreenButton={exitFullscreenButton}
			chromeExtensionsMenu={chromeExtensionsMenu}
			dialog={dialog}
			userPermission={userPermission}
			bookmarkDialog={bookmarkDialog}
			blockedPopup={blockedPopup}
		/>
	</Provider>
);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
	render(
		appElement,
		document.getElementById('root')
	);
}

export default appElement;
export {appElement};
