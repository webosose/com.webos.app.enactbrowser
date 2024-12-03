// Copyright 2019 LG Electronics, Inc.
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

// FIXME(neva): Commented to fix build issue on RP build #2250
// global window

function getDefaults() {
    if (typeof window.getBrowserDefaults === 'function') {
        return window.getBrowserDefaults();
    }
    else {
        return {
            bookmarks: [
                {url:'https://www.google.com/', icon:null, title: 'Google'},
                {url:'https://www.w3.org/', icon:null, title: 'W3C'},
                {url:'https://www.bbc.com/news', icon:null, title: 'BBC'},
                {url:'https://stackoverflow.com/', icon:null, title: 'Stackoverflow'}
            ],
            settings: {
                startupPage: 'newTabPage',
                homePageUrl: 'https://www.google.com',
                searchEngine: 'Google',
                alwaysShowBookmarks: false,
                privateBrowsing: false,
                siteFiltering: 'off',
                pinNumber: '0000',
                useJSErrorPage: false,
                restorePrevSessionPolicy: 'onlyLastTab',
                maxActiveTabFamilies: 1,
                maxSuspendedTabFamilies: 2,
                maxSuspendedNormal: 3,
                maxSuspendedLow: 1,
                maxSuspendedCritical: 0,
                alertsCountBeforePreventionRequest: 3,
                privateBrowsingCueBgColor: '#910137',
                privateBrowsingCueTextColor: '#ce2e6b',
            },
            sitefiltering: {
                whitelist: [],
                blacklist: []
            },
        };
    }
}

export default getDefaults;
export {getDefaults};
