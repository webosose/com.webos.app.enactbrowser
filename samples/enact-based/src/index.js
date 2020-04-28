// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import ilib from 'ilib';
import {Provider} from 'react-redux';
import React from 'react';
import {render} from 'react-dom';

import App from './App';
import configureStore from './store';

ilib._load = undefined;

const store = configureStore();

let appElement = (
	<Provider store={store}>
		<App store={store} />
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
