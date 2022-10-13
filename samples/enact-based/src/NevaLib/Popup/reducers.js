// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* reducers */

import { actionTypes as types } from './constants';

const initialPopupState = {
	allow_media_popup: false,
};

function popupState(state = initialPopupState, action) {
	switch (action.type) {
		case types.SET_ALLOW_MEDIA_POPUP: {
			console.log("REDUCER reached ====>SET_ALLOW_MEDIA_POPUP")
			return {
				...state,
				allow_media_popup: action.payload
			}
		}
		default:
			return state;
	}
}

export default popupState;
