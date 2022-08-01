// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React from 'react';
import {render} from 'react-dom';
import InputSuggestionList from './App/InputSuggestionList';
import InputSuggestionListModel from './components/InputSuggestionListModel';

// eslint-disable-next-line no-unused-vars
const islModel = new InputSuggestionListModel(); // Input Suggestion List model

const appElement = (<InputSuggestionList />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
	render(appElement, document.getElementById('root'));
}

export default appElement;
