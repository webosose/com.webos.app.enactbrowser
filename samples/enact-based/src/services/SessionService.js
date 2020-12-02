// Copyright (c) 2020 LG Electronics, Inc.
//
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import LS2Request from '@enact/webos/LS2Request';

const SessionService = {
	/*
	 * luna-send -f -n 1 luna://com.webos.service.sessionmanager/getSessionList '{}'
	 */
	getSessionIds: ({onSuccess, onFailure}) => {
		const req = new LS2Request();
		req.send({
			service: 'luna://com.webos.service.sessionmanager',
			method: 'getSessionList',
			subscribe: true,
			onSuccess: (res) => {
				// The following normalizes the data for faster lookups
				// This shows restructured data to use them properly in this application.
				//
				// from this, an object:
				// {
				//     "sessionList": [
				//         {
				//             "status": "running",
				//             "pid": 1544,
				//             "userInfo": {
				//                 "userId": "driver0"
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
				//      {"userId":"driver0", deviceSetId":"AVN", sessionId:"xxxx-xxxx-xxxx"}
				//  ]

				const
					{sessionList} = res,
					retval = [];

				sessionList.forEach( ({userInfo: {userId}, deviceSetInfo: {deviceSetId}, sessionId}) => {
					retval.push({
						userId,
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

export default SessionService;
