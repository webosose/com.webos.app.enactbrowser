// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* reducers */

import {actionTypes as types} from './constants';

const initialSiteFilterState = {
	urlList:[],
};

function siteFilterState (state = initialSiteFilterState, action = '') {
	switch (action.type) {
		case types.SET_SITE_FILTER_LIST:
			return {urlList: action.urlList};

		default:
			return state;
	}
}

export default siteFilterState;
