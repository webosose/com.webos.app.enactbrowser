// Copyright (c) 2020~2021 LG Electronics, Inc.
//
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import LS2Request from '@enact/webos/LS2Request';

const AccountService = {
	/*
	 * luna-send -f -n 1 luna://com.webos.service.account/getSessions '{}'
	 */
	getSessionIds: ({onSuccess, onFailure}) => {
		const req = new LS2Request();
		req.send({
			service: 'luna://com.webos.service.account',
			method: 'getSessions',
			subscribe: true,
			onSuccess: (res) => {
				// The following normalizes the data for faster lookups
				// This shows restructured data to use them properly in this application.
				//
				// from this, an object:
				// {
				//     "sessions": [
				//         {
				//             "status": "running",
				//             "accountInfo": {
				//                 "accountId": "driver0"
				//             },
				//             "deviceSetInfo": {
				//                 "resolution": "1920x720",
				//                 "displayId": 0,
				//                 "deviceType": "AVN",
				//                 "deviceSetId": "AVN",
				//                 "port": {
				//                     "inspectorBrowser": 9999,
				//                     "dialserver": 5678,
				//                     "ssg": 7891,
				//                     "inspectorWam": 9998
				//                 }
				//             },
				//             "sessionId": "xxxx-xxxx-xxxx"
				//         }
				//     ]
				// }
				//
				// to this, an array of objects:
				//  [
				//      {"name":"driver0", deviceSetId":"AVN", sessionId:"xxxx-xxxx-xxxx"}
				//  ]

				const
					{sessions} = res,
					retval = [];

				sessions.forEach( ({accountInfo: {name}, deviceSetInfo: {deviceSetId}, sessionId}) => {
					retval.push({
						name,
						deviceSetId,
						sessionId
					});
				});

				onSuccess(retval);
			},
			onFailure: (res) => {
				const err = new Error(res.errorText);
				err.code = res.errorCode;
				onFailure(err);
			}
		});
		return req;
	}
};

export default AccountService;
