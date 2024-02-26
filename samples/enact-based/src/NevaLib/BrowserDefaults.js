// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

// FIXME(neva): Commented to fix build issue on RP build #2250
// global window

// if defaults.js file is missing then browser will work anyway
function getDefaults() {
    if (typeof window.getBrowserDefaults === 'function') {
        return window.getBrowserDefaults();
    }
    else {
        return {
            bookmarks: [
                {url:'https://google.com/', icon:null, title: 'Google'},
                {url:'https://www.w3.org/', icon:null, title: 'W3C'},
                {url:'http://www.bbc.com/news/', icon:null, title: 'BBC'},
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
