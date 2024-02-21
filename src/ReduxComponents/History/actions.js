// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* actions */

import {actionTypes as types} from './constants';

const setRetrievedHistoryData = (data) => ({
	type: types.SET_RETRIEVED_HISTORY_DATA,
	data
});

const clearHistory = (ids) => ({
	type: types.CLEAR_HISTORY,
	ids
});

export {
	setRetrievedHistoryData,
	clearHistory
};
