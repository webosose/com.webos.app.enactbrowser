// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* actions */

import {actionTypes as types} from './constants';

const setZoomFactor = (value) => ({
	type: types.SET_ZOOM_FACTOR,
	value
});

const setRecentlyClosed = (data) => ({
	type: types.SET_RECENTLY_CLOSED,
	data
});

const setUrlSuggestions = (data) => ({
	type: types.SET_URL_SUGGESTIONS,
	data
});

const setMostVisitedSites = (data) => ({
	type: types.SET_MOST_VISITED_SITES,
	data
});

const removeMostVisitedSite = (url) => ({
	type: types.REMOVE_MOST_VISITED_SITE,
	url
});

export {
	setZoomFactor,
	setRecentlyClosed,
	setUrlSuggestions,
	setMostVisitedSites,
	removeMostVisitedSite
};
