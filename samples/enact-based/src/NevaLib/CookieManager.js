// Copyright (c) 2018-2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
const
  ALLOWED_ALL_TYPE = 1,           // all first party and 3rd party cookies will be allowed to save
  BLOCKED_ALL_TYPE = 2,           // only 1st party cookies will be allowed and 3rd party cookies will be blocked to save
  BLOCKED_THIRD_PARTY_TYPE = 3;   // both 1st party cookies and 3rd party cookies will be blocked to save
*/

class CookieManager {
  clearCookies() {
    if (window.navigator && window.navigator.cookiemanager) {
      window.navigator.cookiemanager.clearAllCookies();
    } else {
      console.error('CookieManager interface is not implemented! Check your WebOS version!');
    }
  }
}

export default CookieManager;
export { CookieManager };
