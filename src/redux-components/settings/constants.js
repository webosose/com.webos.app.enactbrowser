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

/* constants */

const actionTypes = {
	SET_STARTUP_PAGE: 'SET_STARTUP_PAGE',
	SET_HOME_PAGE_URL: 'SET_HOME_PAGE_URL',
	SET_SEARCH_ENGINE: 'SET_SEARCH_ENGINE',
	SET_ALWAYS_SHOW_BOOKMARKS: 'SET_ALWAYS_SHOW_BOOKMARKS',
	SET_PRIVATE_BROWSING: 'SET_PRIVATE_BROWSING',
	SET_PIN_NUMBER: 'SET_PIN_NUMBER',
	SET_SITE_FILTERING: 'SET_SITE_FILTERING',
	SET_APPROVED_SITES: 'SET_APPROVED_SITES',
	ADD_APPROVED_SITE: 'ADD_APPROVED_SITE',
	REMOVE_APPROVED_SITES: 'REMOVE_APPROVED_SITES',
	SET_BLOCKED_SITES: 'SET_BLOCKED_SITES',
	ADD_BLOCKED_SITE: 'ADD_BLOCKED_SITE',
	REMOVE_BLOCKED_SITES: 'REMOVE_BLOCKED_SITES',
	SET_USE_JS_ERROR_PAGE: 'SET_USE_JS_ERROR_PAGE',
	SET_RESTORE_PREV_SESSION_POLICY: 'SET_RESTORE_PREV_SESSION_POLICY',
	SET_MAX_ACTIVE_TAB_FAMILIES: 'SET_MAX_ACTIVE_TAB_FAMILIES',
	SET_MAX_SUSPENDED_TAB_FAMILIES: 'SET_MAX_SUSPENDED_TAB_FAMILIES',
	SET_MAX_SUSPENDED_NORMAL: 'SET_MAX_SUSPENDED_NORMAL',
	SET_MAX_SUSPENDED_LOW: 'SET_MAX_SUSPENDED_LOW',
	SET_MAX_SUSPENDED_CRITICAL: 'SET_MAX_SUSPENDED_CRITICAL',
};

export {
	actionTypes
};
