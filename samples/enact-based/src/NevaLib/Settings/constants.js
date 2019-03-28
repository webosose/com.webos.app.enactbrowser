// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* constants */

const actionTypes = {
	SET_STARTUP_PAGE: 'SET_STARTUP_PAGE',
	SET_HOME_PAGE_URL: 'SET_HOME_PAGE_URL',
	SET_SEARCH_ENGINE: 'SET_SEARCH_ENGINE',
	SET_ALWAYS_SHOW_BOOKMARKS: 'SET_ALWAYS_SHOW_BOOKMARKS',
	SET_PRIVATE_BROWSING: 'SET_PRIVATE_BROWSING',
	SET_PIN_NUMBER: 'SET_PIN_NUMBER',
	SET_SITE_FILTERING: 'SET_SITE_FILTERING',
	/* TODO: Move to site filtering part */
	SET_APPROVED_SITES: 'SET_APPROVED_SITES',
	ADD_APPROVED_SITE: 'ADD_APPROVED_SITE',
	REMOVE_APPROVED_SITES: 'REMOVE_APPROVED_SITES',
	SET_BLOCKED_SITES: 'SET_BLOCKED_SITES',
	ADD_BLOCKED_SITE: 'ADD_BLOCKED_SITE',
	REMOVE_BLOCKED_SITES: 'REMOVE_BLOCKED_SITES'
};

export {
	actionTypes
};
