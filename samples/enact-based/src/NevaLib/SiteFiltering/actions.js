// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* actions */

import {actionTypes as types} from './constants';

const setSiteFilterList = (urlList) => ({
	type: types.SET_SITE_FILTER_LIST,
	urlList
});

const setSiteFilterResponse = (status) => ({
	type: types.SITE_FILTER_RESPONSE,
	status
});

export {
	setSiteFilterList,
	setSiteFilterResponse
};
