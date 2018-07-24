// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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
