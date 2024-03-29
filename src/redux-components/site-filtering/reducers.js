// Copyright 2018 LG Electronics, Inc.
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
