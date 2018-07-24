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

import {SettingsKeys, SettingsConsts} from './Settings';

//TODO: Should be dynamically loaded file
const config = {
    'defaultBookmarks' : [
        {url:'https://google.com/', icon:null, title: 'Google'},
        {url:'https://www.w3.org/', icon:null, title: 'W3C'},
        {url:'http://www.bbc.com/news/', icon:null, title: 'BBC'},
        {url:'https://stackoverflow.com/', icon:null, title: 'Stackoverflow'}
    ],
    'defaultSettings' : {
        [SettingsKeys.STARTUP_PAGE_KEY]: SettingsConsts.NEW_TAB_PAGE,
        [SettingsKeys.HOME_PAGE_URL_KEY]: 'https://www.google.com',
        [SettingsKeys.SEARCH_ENGINE_KEY]: 'Google',
        [SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY]: false,
        [SettingsKeys.PRIVATE_BROWSING_KEY]: false,
        [SettingsKeys.SITE_FILTERING_KEY]: 'off',
        [SettingsKeys.PIN_NUMBER_KEY]: '0000'
    },
    'restorePrevSessionPolicy':'onlyLastTab', /*onlyLastTab || allTabs*/
    'rendererPerTab':{
        'maxActiveTabs': 1,
        'maxSuspendedTabs': 2
    },
    'memoryManager': {
        'maxSuspendedNormal': 3,
        'maxSuspendedLow': 1,
        'maxSuspendedCritical': 0
    }

}

export default config;
