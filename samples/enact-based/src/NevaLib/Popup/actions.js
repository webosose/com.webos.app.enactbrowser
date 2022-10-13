// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* actions */

import { actionTypes as types } from './constants';

const set_allow_media_popup = (data) => ({
	type: types.SET_ALLOW_MEDIA_POPUP,
	payload: data
});

export {
	set_allow_media_popup,
};
