// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {Provider} from 'react-redux';
import React from 'react';
import {render} from 'react-dom';

import App from './App';
import configureStore from './store';
import {UIOverlay} from 'js-browser-lib/UIOverlay';
import {ExitFullscreenButtonBase} from 'js-browser-lib/ExitFullscreenButtonBase';
import {Menu as MenuBase} from 'js-browser-lib/MenuBase';
import {ChromeExtensionsBase} from 'js-browser-lib/ChromeExtensionsBase';
import {initLogging} from 'js-browser-lib/Logger';
import {isWindowReady} from '@enact/core/snapshot';

if (typeof window !== 'undefined') {
	initLogging();
}

const store = configureStore();
const uioverlay = new UIOverlay();
const menu = new MenuBase(uioverlay);
const exitFullscreenButton = new ExitFullscreenButtonBase(uioverlay);
const chromeExtensionsMenu = (isWindowReady() && typeof window.neva !== 'undefined') ? new ChromeExtensionsBase(uioverlay) : null;


let appElement = (
	<Provider store={store}>
		<App store={store}
			uioverlay={uioverlay}
			menu={menu}
			exitFullscreenButton={exitFullscreenButton}
			chromeExtensionsMenu={chromeExtensionsMenu}
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
