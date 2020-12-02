// Copyright (c) 2019-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

function getBrowserDefaults () {
	return {
		bookmarks: [
			{url:'https://google.com/', icon:null, title: 'Google'},
			{url:'https://www.w3.org/', icon:null, title: 'W3C'},
			{url:'http://www.bbc.com/news/', icon:null, title: 'BBC'},
			{url:'https://stackoverflow.com/', icon:null, title: 'Stackoverflow'}
		],
		config: {
			useBuiltInErrorPages: true,
			restorePrevSessionPolicy: 'onlyLastTab', /* OR allTabs*/
			// Limitations for Simple Tab management policy
			simplePolicy: {
				'maxActiveTabFamilies': 1,
				'maxSuspendedTabFamilies': 2
			},
			// Limitations for MemoryManager aware tab policy
			memoryManager: {
				'maxSuspendedNormal': 3,
				'maxSuspendedLow': 1,
				'maxSuspendedCritical': 0
			}
		},
		settings: {
			startupPage: 'newTabPage', /* OR continue OR homePage*/
			homePageUrl: 'https://www.google.com',
			searchEngine: 'Google',
			alwaysShowBookmarks: false,
			privateBrowsing: false,
			siteFiltering: 'off', /* OR whitelist OR blacklist*/
			pinNumber: '0000'
		},
		sitefiltering: {
			whitelist: ['*google*', '*://*yandex*'],
			blacklist: ['*youtube*', '*lenta.ru*']
		}
	};
}
