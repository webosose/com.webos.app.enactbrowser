// Copyright (c) 2020 LG Electronics, Inc.
//
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import LS2Request from '@enact/webos/LS2Request';

const IntentService = {
	/*
	 *luna-send -f -n 1 luna://com.webos.service.intent/start '{ "intent": { "action": "action_url", "uri":"http://google.com"}}'
	 */
	shareURL: (sessionId, uri) => {
		const
			req = new LS2Request(),
			intent = {
				action: 'view',
				uri
			},
			parameters = {
				sessionId,
				intent
			};

		req.send({
			service: 'luna://com.webos.service.intent',
			method: 'start',
			parameters,
			onSuccess: (res) => {
				console.debug(res.returnValue); // eslint-disable-line no-console
			},
			onFailure: (res) => {
				const err = new Error(res.errorText);
				err.code = res.errorCode;
			}
		});
	}
};

export default IntentService;
