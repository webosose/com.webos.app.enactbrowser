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
import {Menu as MenuBase} from 'js-browser-lib/MenuBase';


const store = configureStore();
const uioverlay = new UIOverlay();

const menu = new MenuBase(uioverlay);


let appElement = (
	<Provider store={store}>
		<App store={store} uioverlay={uioverlay} menu={menu}/>
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
