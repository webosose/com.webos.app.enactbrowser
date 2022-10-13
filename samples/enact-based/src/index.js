// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* global ENACT_PACK_ISOMORPHIC */
import {createRoot, hydrateRoot} from 'react-dom/client';
import ilib from 'ilib';
import {Provider} from 'react-redux';
import React from 'react';


import App from './App';
import configureStore from './store';

ilib._load = undefined; // eslint-disable-line no-undefined

const store = configureStore();


let appElement = (
	<Provider store={store}>
		<App store={store} />
	</Provider>
);

// In a browser environment, render the app to the document.
if (typeof window !== 'undefined') {
    if (ENACT_PACK_ISOMORPHIC) {
        hydrateRoot(document.getElementById('root'), appElement);
    } else {
        createRoot(document.getElementById('root')).render(appElement);
    }
}

export default appElement;
export {appElement};
