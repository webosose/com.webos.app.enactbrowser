// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/

// if defaults.js file is missing then browser will work anyway
function getDefaults() {
    if (typeof window.getBrowserDefaults === 'function') {
        return window.getBrowserDefaults();
    }
    else {
        return {
            settings: {
                startupPage: 'newTabPage',
                homePageUrl: 'https://www.google.com',
                searchEngine: 'Google',
                alwaysShowBookmarks: false,
                privateBrowsing: false,
                siteFiltering: 'off',
                pinNumber: '0000'
            },
            config: {
                useBuiltInErrorPages: true,
                restorePrevSessionPolicy: 'onlyLastTab',
                simplePolicy: {
                    'maxActiveTabs': 1,
                    'maxSuspendedTabs': 2
                },
                memoryManager: {
                    'maxSuspendedNormal': 3,
                    'maxSuspendedLow': 1,
                    'maxSuspendedCritical': 0
                }
            }
        };
    }
}

export default getDefaults;
export {getDefaults};